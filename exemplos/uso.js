#!/usr/bin/env node
// Exemplo de uso da biblioteca pela porta de entrada do pacote.
//
//   node exemplos/uso.js 5 5
//
// Resolve o tabuleiro e diz quais pedras o preto pode tirar na abertura.

import { resolve } from '../src/index.js'

const w = Number(process.argv[2] || 5)
const h = Number(process.argv[3] || 5)
const r = resolve(w, h)
console.log(`${w}x${h}: vence o ${r.vence}`)
if (r.pedrasBoas.length) console.log(`pedras que o preto pode tirar e ganhar contra qualquer resposta: ${r.pedrasBoas.map((p) => '(' + p.join(',') + ')').join(' ')}`)
else console.log(`nenhuma pedra resiste; o preto ganha so em ${r.paresBons} dos ${r.pares} pares (tira, responde)`)
