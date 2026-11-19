// As tabelas do README. Calculadas aqui, e em lugar nenhum mais.

import { tabuleiro, aberturas } from './konane.js'
import { simetriaDasAberturas } from './juiz.js'

const guardadas = new Map()
function umaVez (k, fn) {
  if (!guardadas.has(k)) guardadas.set(k, fn())
  return guardadas.get(k)
}

/** Um tabuleiro: quem vence, quais pedras resistem, quantos pares sao bons. */
export function resolve (w, h) {
  return umaVez(`r:${w}x${h}`, () => {
    const t = tabuleiro(w, h)
    const ab = aberturas(t)
    const boas = ab.linhas.filter((l) => l.resiste)
    const pares = ab.linhas.reduce((s, l) => s + l.respostas.length, 0)
    const bons = ab.linhas.reduce((s, l) => s + l.respostas.filter((r) => r.pretoVence).length, 0)
    return {
      w, h, casas: t.casas,
      vence: boas.length ? 'preto' : 'branco',
      pedrasBoas: boas.map((l) => [Math.floor(l.p / w), l.p % w]),
      pedras: ab.linhas.length,
      paresBons: bons,
      pares,
      nos: ab.motor.nos
    }
  })
}

/** A faixa 1 x n: em quais n o preto vence. */
export function faixa (ate = 30) {
  return umaVez(`faixa:${ate}`, () => {
    const pretoVence = []
    for (let n = 2; n <= ate; n++) if (resolve(n, 1).vence === 'preto') pretoVence.push(n)
    return pretoVence
  })
}

export const TABULEIROS = [[3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [4, 4], [5, 4], [6, 4], [5, 5]]

export function tabela () {
  return umaVez('tabela', () => TABULEIROS.map(([w, h]) => resolve(w, h)))
}

export function simetrias () {
  return umaVez('sim', () => [[4, 4], [5, 5], [6, 4], [5, 3]].map(([w, h]) => ({ w, h, ...simetriaDasAberturas(tabuleiro(w, h)) })))
}
