#!/usr/bin/env node
// O medidor. Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js             todas
//   node ferramentas/medidor.js tabuleiros  quem vence cada tabuleiro e com qual abertura
//   node ferramentas/medidor.js faixa       a faixa 1 x n de 2 a 30
//   node ferramentas/medidor.js simetria    aberturas simetricas dao o mesmo resultado
//   node ferramentas/medidor.js sete        o 7x4, 28 casas (~25 s)

import { tabela, faixa, simetrias, resolve } from '../src/medidas.js'

const pad = (s, w) => String(s).padStart(w)

function linha (l) {
  console.log(`   ${pad(l.w + 'x' + l.h, 4)} ${pad(l.casas, 2)} casas   vence ${l.vence.padEnd(6)}   pedras que resistem ${l.pedrasBoas.length} de ${pad(l.pedras, 2)}${l.pedrasBoas.length ? ' (' + l.pedrasBoas.map((p) => p.join(',')).join(' ') + ')' : ''}   pares bons para o preto ${pad(l.paresBons, 2)} de ${pad(l.pares, 2)}   ${l.nos.toLocaleString('pt-BR')} nos`)
}

function tTabuleiros () {
  console.log('\n== quem vence, contando a abertura de remocao ==')
  for (const l of tabela()) linha(l)
}

function tFaixa () {
  console.log('\n== a faixa 1 x n, de 2 a 30: o preto vence em ==')
  console.log('   ' + faixa(30).join(', '))
}

function tSimetria () {
  console.log('\n== aberturas que sao imagem uma da outra ==')
  for (const s of simetrias()) console.log(`   ${s.w}x${s.h}  ${s.aberturas} aberturas, ${s.quebras} quebras`)
}

const partes = { tabuleiros: tTabuleiros, faixa: tFaixa, simetria: tSimetria, sete: () => linha(resolve(7, 4)) }
const pedido = process.argv[2]
if (!pedido) { tTabuleiros(); tFaixa(); tSimetria() } else if (partes[pedido]) partes[pedido]()
else { console.error(`nao conheco "${pedido}". conheco: ${Object.keys(partes).join(', ')}`); process.exit(1) }
