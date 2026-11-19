// Os casos caros: o 6x4 e o 5x5, que a chave antiga resolvia errado, e a faixa
// ate 30 casas.

import test from 'node:test'
import assert from 'node:assert/strict'

import { resolve, faixa } from '../src/medidas.js'

test('6x4: o branco vence, e o preto tem 8 pares bons de 38 (a chave antiga dava 11)', { timeout: 600000 }, () => {
  const r = resolve(6, 4)
  assert.equal(r.vence, 'branco')
  assert.equal(r.paresBons, 8)
  assert.equal(r.pares, 38)
})

test('5x5: o preto vence, e as pedras que resistem sao os 4 cantos e o centro', { timeout: 600000 }, () => {
  const r = resolve(5, 5)
  assert.equal(r.vence, 'preto')
  assert.deepEqual(r.pedrasBoas, [[0, 0], [0, 4], [2, 2], [4, 0], [4, 4]])
  assert.equal(r.paresBons, 28)
  assert.equal(r.pares, 40)
})

test('a faixa 1 x n ate 30: 5, 9, 13, 17, 21, 25, 29', { timeout: 600000 }, () => {
  assert.deepEqual(faixa(30), [5, 9, 13, 17, 21, 25, 29])
})

test('7x4: o branco vence, 5 pares bons de 45', { timeout: 900000 }, () => {
  const r = resolve(7, 4)
  assert.equal(r.vence, 'branco')
  assert.equal(r.paresBons, 5)
  assert.equal(r.pares, 45)
})
