// Os numeros do README, presos. (O 6x4 e o 5x5 no arquivo pesado.)

import test from 'node:test'
import assert from 'node:assert/strict'

import { resolve } from '../src/medidas.js'

test('o branco vence todos os tabuleiros de 2 e 3 linhas medidos, e o 4x4 e o 5x4', () => {
  for (const [w, h] of [[3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [4, 4], [5, 4]]) {
    assert.equal(resolve(w, h).vence, 'branco', `${w}x${h}`)
  }
})

test('pares de abertura bons para o preto, mesmo onde ele perde', () => {
  assert.equal(resolve(4, 4).paresBons, 4)
  assert.equal(resolve(4, 4).pares, 24)
  assert.equal(resolve(5, 4).paresBons, 9)
  assert.equal(resolve(3, 3).paresBons, 0)
})

test('a faixa 1 x n: o preto vence exatamente em n = 1 (mod 4), de 5 a 21', () => {
  const vence = []
  for (let n = 2; n <= 22; n++) if (resolve(n, 1).vence === 'preto') vence.push(n)
  assert.deepEqual(vence, [5, 9, 13, 17, 21])
})
