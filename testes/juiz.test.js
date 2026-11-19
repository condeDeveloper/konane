import test from 'node:test'
import assert from 'node:assert/strict'

import { tabuleiro, cheio, Motor } from '../src/konane.js'
import { MotorBurro, somaEhZero, simetriaDasAberturas } from '../src/juiz.js'

test('o motor e o motor sem memoria concordam em toda abertura do 4x4 e do 9x1', () => {
  for (const [w, h] of [[4, 4], [9, 1], [4, 3]]) {
    const t = tabuleiro(w, h)
    const ini = cheio(t)
    for (let p = 0; p < t.casas; p++) {
      if (!(ini.pretas & (1 << p))) continue
      for (const b of t.passo[p]) {
        if (b < 0 || !(ini.brancas & (1 << b))) continue
        const pos = { pretas: ini.pretas & ~(1 << p), brancas: ini.brancas & ~(1 << b) }
        assert.equal(new Motor(t).vence(pos, 0), new MotorBurro(t).vence(pos, 0), `${w}x${h} tira ${p}, responde ${b}`)
      }
    }
  }
})

test('P + (-P) e de segundo jogador em todas as 729 posicoes do 3x2', () => {
  const t = tabuleiro(3, 2)
  for (let c = 0; c < 729; c++) {
    let x = c; let p = 0; let b = 0
    for (let k = 0; k < 6; k++) { const d = x % 3; x = (x - d) / 3; if (d === 1) p |= 1 << k; else if (d === 2) b |= 1 << k }
    assert.equal(somaEhZero(t, { pretas: p, brancas: b }), true)
  }
})

test('aberturas simetricas dao o mesmo resultado', () => {
  for (const [w, h] of [[4, 4], [5, 3]]) assert.equal(simetriaDasAberturas(tabuleiro(w, h)).quebras, 0)
})
