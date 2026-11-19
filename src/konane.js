// Konane: as damas havaianas.
//
// O tabuleiro comeca CHEIO, em xadrez: preta na casa (i, j) com i + j par,
// branca nas outras. A abertura e de remocao: o preto tira uma pedra preta
// sua, e o branco tira uma pedra branca VIZINHA do buraco (em cima, embaixo, a
// esquerda ou a direita). Dai em diante o preto comeca, e cada lance e um PULO:
// uma pedra sua salta por cima de uma pedra adversaria vizinha e cai na casa
// vazia logo atras, capturando a que foi pulada. Na mesma direcao, a mesma pedra
// pode emendar outros pulos; parar depois de qualquer um deles e um lance
// diferente. Quem nao tem lance PERDE.
//
// As pedras sao duas mascaras de bits, uma por cor (ate 30 casas).

export const PRETO = 0
export const BRANCO = 1

export function tabuleiro (largura, altura) {
  const casas = largura * altura
  if (casas > 30) throw new Error(`${largura}x${altura} passa de 30 casas`)
  // passo[c][d] = casa vizinha de c na direcao d, ou -1 fora do tabuleiro.
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]
  const passo = []
  for (let i = 0; i < altura; i++) {
    for (let j = 0; j < largura; j++) {
      passo.push(dirs.map(([di, dj]) => {
        const ni = i + di
        const nj = j + dj
        return ni >= 0 && ni < altura && nj >= 0 && nj < largura ? ni * largura + nj : -1
      }))
    }
  }
  return { largura, altura, casas, passo }
}

/** O tabuleiro cheio em xadrez. */
export function cheio (t) {
  let pretas = 0
  let brancas = 0
  for (let i = 0; i < t.altura; i++) {
    for (let j = 0; j < t.largura; j++) {
      const c = i * t.largura + j
      if ((i + j) % 2 === 0) pretas |= 1 << c
      else brancas |= 1 << c
    }
  }
  return { pretas, brancas }
}

/** Os lances de `quem`: cada pulo, e cada emenda de pulos na mesma direcao. */
export function lances (t, pos, quem) {
  const minhas = quem === PRETO ? pos.pretas : pos.brancas
  const dele = quem === PRETO ? pos.brancas : pos.pretas
  const ocupada = pos.pretas | pos.brancas
  const saida = []
  let resto = minhas
  while (resto) {
    const b = resto & -resto
    const de = 31 - Math.clz32(b)
    resto ^= b
    for (let d = 0; d < 4; d++) {
      let atual = de
      let capturadas = 0
      while (true) {
        const sobre = t.passo[atual][d]
        if (sobre < 0 || !(dele & (1 << sobre))) break
        const cai = t.passo[sobre][d]
        if (cai < 0 || (ocupada & (1 << cai))) break
        capturadas |= 1 << sobre
        atual = cai
        saida.push({ de, para: atual, capturadas })
      }
    }
  }
  return saida
}

export function aplica (pos, quem, l) {
  const mov = (1 << l.de) | (1 << l.para)
  if (quem === PRETO) return { pretas: pos.pretas ^ mov, brancas: pos.brancas & ~l.capturadas }
  return { brancas: pos.brancas ^ mov, pretas: pos.pretas & ~l.capturadas }
}

export function trocaCores (pos) { return { pretas: pos.brancas, brancas: pos.pretas } }

/**
 * A chave da memoria.
 *
 * A primeira versao era `pretas * 2^32 + brancas * 2 + quem`. Com 22 casas ou
 * mais, `pretas * 2^32` passa de 2^53, o passo entre dois numeros representaveis
 * vira 2, e o ultimo bit — QUEM ESTA NA VEZ — some no arredondamento. A posicao
 * com o preto na vez e a com o branco na vez viravam a mesma chave, e o motor
 * respondia uma pergunta com a resposta da outra. Quem pegou foi a simetria: no
 * 5x5 tres cantos resistiam e o quarto nao.
 *
 * Agora o deslocamento e o minimo que cabe (casas + 1 bits), e acima de 26 casas
 * a chave vira texto.
 */
export function chave (t, pos, quem) {
  if (t.casas <= 26) return (pos.pretas >>> 0) * Math.pow(2, t.casas + 1) + (pos.brancas >>> 0) * 2 + quem
  return `${pos.pretas >>> 0},${pos.brancas >>> 0},${quem}`
}

/** O motor: `quem` esta na vez e ganha? Com memoria. */
export class Motor {
  constructor (t) { this.t = t; this.memoria = new Map(); this.nos = 0 }
  vence (pos, quem) {
    const k = chave(this.t, pos, quem)
    const g = this.memoria.get(k)
    if (g !== undefined) return g
    this.nos++
    let r = false
    for (const l of lances(this.t, pos, quem)) {
      if (!this.vence(aplica(pos, quem, l), 1 - quem)) { r = true; break }
    }
    this.memoria.set(k, r)
    return r
  }
}

/**
 * As aberturas: o preto tira a pedra p, o branco tira a vizinha b. Para cada
 * par, quem ganha com o preto comecando a pular.
 */
export function aberturas (t, motor) {
  const m = motor || new Motor(t)
  const ini = cheio(t)
  const linhas = []
  for (let p = 0; p < t.casas; p++) {
    if (!(ini.pretas & (1 << p))) continue
    const respostas = []
    for (const b of t.passo[p]) {
      if (b < 0 || !(ini.brancas & (1 << b))) continue
      const pos = { pretas: ini.pretas & ~(1 << p), brancas: ini.brancas & ~(1 << b) }
      respostas.push({ b, pretoVence: m.vence(pos, PRETO) })
    }
    // A pedra p e boa para o preto se TODA resposta do branco perde.
    linhas.push({ p, respostas, resiste: respostas.length > 0 && respostas.every((r) => r.pretoVence) })
  }
  return { linhas, motor: m }
}

/** Quem ganha o jogo inteiro, contando a abertura: o preto ganha se alguma pedra resiste. */
export function vencedor (t) {
  const r = aberturas(t)
  const boas = r.linhas.filter((l) => l.resiste).map((l) => l.p)
  return { pretoVence: boas.length > 0, boas, aberturas: r.linhas.length, nos: r.motor.nos }
}
