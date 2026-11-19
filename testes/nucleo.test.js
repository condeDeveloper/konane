import test from 'node:test'
import assert from 'node:assert/strict'

import { tabuleiro, cheio, lances, aplica, chave, Motor, PRETO, BRANCO } from '../src/konane.js'

test('o tabuleiro cheio e um xadrez, preta no canto (0,0)', () => {
  const t = tabuleiro(4, 1)
  const c = cheio(t)
  assert.equal(c.pretas, 0b0101)
  assert.equal(c.brancas, 0b1010)
})

test('no tabuleiro cheio ninguem tem lance: nao ha casa vazia para cair', () => {
  const t = tabuleiro(4, 4)
  const c = cheio(t)
  assert.equal(lances(t, c, PRETO).length, 0)
  assert.equal(lances(t, c, BRANCO).length, 0)
})

test('o pulo captura a pedra pulada e move a sua', () => {
  // . O # . : o preto da casa 2 pula o branco da 1 e cai na 0.
  const t = tabuleiro(4, 1)
  const pos = { pretas: 0b0100, brancas: 0b0010 }
  const ls = lances(t, pos, PRETO)
  assert.equal(ls.length, 1)
  const d = aplica(pos, PRETO, ls[0])
  assert.equal(d.pretas, 0b0001)
  assert.equal(d.brancas, 0)
})

test('o pulo duplo na mesma direcao e um lance, e parar no meio e outro', () => {
  // # O . O . : o preto pode pular uma ou duas brancas.
  const t = tabuleiro(5, 1)
  const pos = { pretas: 0b00001, brancas: 0b01010 }
  const ls = lances(t, pos, PRETO)
  assert.equal(ls.length, 2)
  assert.deepEqual(ls.map((l) => l.para).sort(), [2, 4])
})

test('nao ha pulo sobre pedra da propria cor nem para casa ocupada', () => {
  const t = tabuleiro(4, 1)
  assert.equal(lances(t, { pretas: 0b0011, brancas: 0 }, PRETO).length, 0)
  assert.equal(lances(t, { pretas: 0b0001, brancas: 0b0110 }, PRETO).length, 0)
})

test('a chave separa quem esta na vez mesmo com a mascara alta', () => {
  // A primeira versao perdia o bit da vez a partir de 22 casas.
  for (const [w, h] of [[6, 4], [5, 5], [6, 5]]) {
    const t = tabuleiro(w, h)
    const pos = { pretas: 1 << (t.casas - 1), brancas: 1 }
    assert.notEqual(chave(t, pos, PRETO), chave(t, pos, BRANCO), `${w}x${h}`)
  }
})

test('quem fica sem lance perde', () => {
  const t = tabuleiro(3, 1)
  const m = new Motor(t)
  assert.equal(m.vence({ pretas: 0b001, brancas: 0b100 }, PRETO), false)
})
