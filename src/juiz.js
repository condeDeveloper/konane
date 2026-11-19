// O juiz. Tres caminhos que nao passam pelo motor com memoria.
//
// 1. `MotorBurro` — a mesma pergunta sem memoria nenhuma. Se ele e o motor
//    discordarem, a memoria esta mentindo (foi o que aconteceu com a chave que
//    perdia o bit da vez). So alcanca tabuleiro pequeno.
//
// 2. `somaEhZero` — trocar as cores e o negativo do jogo, e a teoria obriga
//    P + (-P) a ser de segundo jogador. Jogo nos DOIS tabuleiros ao mesmo tempo,
//    com busca propria.
//
// 3. `simetriaDasAberturas` — as 8 simetrias do quadrado (ou 4 do retangulo)
//    preservam o xadrez e as regras, entao aberturas que sao imagem uma da outra
//    tem de dar o mesmo resultado. Foi esse juiz que acusou a chave quebrada.

import { PRETO, BRANCO, lances, aplica, trocaCores, cheio, aberturas } from './konane.js'

export class MotorBurro {
  constructor (t) { this.t = t; this.nos = 0 }
  vence (pos, quem) {
    this.nos++
    for (const l of lances(this.t, pos, quem)) if (!this.vence(aplica(pos, quem, l), 1 - quem)) return true
    return false
  }
}

/** A partida em dois tabuleiros: quem joga escolhe um deles. */
export function somaEhZero (t, pos) {
  const memo = new Map()
  const espelho = trocaCores(pos)
  const vence = (a, b, quem) => {
    const k = `${a.pretas},${a.brancas},${b.pretas},${b.brancas},${quem}`
    const g = memo.get(k)
    if (g !== undefined) return g
    let r = false
    for (const l of lances(t, a, quem)) if (!vence(aplica(a, quem, l), b, 1 - quem)) { r = true; break }
    if (!r) for (const l of lances(t, b, quem)) if (!vence(a, aplica(b, quem, l), 1 - quem)) { r = true; break }
    memo.set(k, r)
    return r
  }
  return !vence(pos, espelho, PRETO) && !vence(pos, espelho, BRANCO)
}

/** As imagens de uma casa pelas simetrias do tabuleiro que preservam o xadrez. */
function imagens (t, c) {
  const i = Math.floor(c / t.largura)
  const j = c % t.largura
  const H = t.altura - 1
  const W = t.largura - 1
  const lista = [[i, j], [i, W - j], [H - i, j], [H - i, W - j]]
  if (t.largura === t.altura) lista.push([j, i], [j, H - i], [W - j, i], [W - j, H - i])
  return lista
    .filter(([a, b]) => (a + b) % 2 === (i + j) % 2)   // so as que mantem a cor da casa
    .map(([a, b]) => a * t.largura + b)
}

/** Aberturas que sao imagem uma da outra dao o mesmo resultado? */
export function simetriaDasAberturas (t) {
  const r = aberturas(t).linhas
  const resiste = new Map(r.map((l) => [l.p, l.resiste]))
  let quebras = 0
  for (const l of r) for (const p of imagens(t, l.p)) if (resiste.has(p) && resiste.get(p) !== l.resiste) quebras++
  return { aberturas: r.length, quebras }
}

export { cheio }
