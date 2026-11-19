# Konane

Konane — as damas havaianas — resolvido por tabuleiro, contando a abertura, em Node puro, sem dependência nenhuma.

O tabuleiro começa **cheio**, em xadrez. A abertura é de remoção: o preto tira uma pedra sua, e o branco tira uma pedra sua **vizinha do buraco**. Daí o preto começa, e cada lance é um pulo: uma pedra salta por cima de uma pedra adversária vizinha e cai na casa vazia logo atrás, capturando-a. Na mesma direção a pedra pode emendar outros pulos — e parar depois de qualquer um deles é outro lance. Quem não tem lance perde.

---

## Os quatro achados

**1. Quase sempre ganha quem responde à abertura.** Em todos os tabuleiros de 2 e 3 linhas medidos, no 4×4, no 5×4 e no 6×4, o branco ganha: não existe pedra que o preto possa tirar sem que o branco tenha uma resposta vencedora. O preto ainda tem pares (tira, responde) bons — 4 de 24 no 4×4, 9 de 31 no 5×4 —, mas o branco nunca é obrigado a cair neles.

**2. No 5×5 o preto ganha, e por cinco portas: as quatro quinas e o centro.** Das 13 pedras pretas, exatamente essas cinco resistem a qualquer resposta. É o 5×5 com a simetria inteira do quadrado aparecendo na resposta.

**3. Na faixa de uma linha, o preto ganha exatamente quando n ≡ 1 (mod 4).** Medido de 2 a 30: 5, 9, 13, 17, 21, 25, 29. Escrevi a regra depois de ver o 5 e o 9, e antes de medir o resto.

**4. A memória do motor mentia, e foi a simetria que contou.** A chave guardava `pretas · 2³² + brancas · 2 + vez`, e acima de 22 casas o bit da vez sumia no arredondamento. O 5×5 saiu com três quinas resistindo e a quarta não — o que é impossível, porque as quatro são a mesma por simetria. Corrigida a chave, mudaram o 5×5, o 6×4, o 1×23 e o 1×24. A seção dos erros conta tudo.

---

## As tabelas

Todos os números saem de `node ferramentas/medidor.js` e estão presos em `testes/`.

| tabuleiro | casas | vence | pedras que resistem | pares bons para o preto |
| --- | --- | --- | --- | --- |
| 3×2 | 6 | branco | 0 de 3 | 0 de 7 |
| 4×2 | 8 | branco | 0 de 4 | 2 de 10 |
| 7×2 | 14 | branco | 0 de 7 | 4 de 19 |
| 3×3 | 9 | branco | 0 de 5 | 0 de 12 |
| 5×3 | 15 | branco | 0 de 8 | 6 de 22 |
| 7×3 | 21 | branco | 0 de 11 | 6 de 32 |
| 4×4 | 16 | branco | 0 de 8 | 4 de 24 |
| 5×4 | 20 | branco | 0 de 10 | 9 de 31 |
| 6×4 | 24 | branco | 0 de 12 | 8 de 38 |
| 5×5 | 25 | **preto** | **5 de 13** | 28 de 40 |
| 6×5 | 30 | **não medido** | | estoura o `Map` do JavaScript |

O 7×4 (28 casas) também foi medido — branco, 5 pares bons de 45 —, em `node ferramentas/medidor.js sete`, que leva uns 25 segundos.

---

## Os juízes

**O motor sem memória** responde a mesma pergunta sem guardar nada, e concorda com o motor em toda abertura do 4×4, do 4×3 e do 9×1.

**A simetria das aberturas**: as simetrias do tabuleiro que preservam o xadrez preservam as regras, então aberturas que são imagem uma da outra têm de dar o mesmo resultado. Zero quebras com a chave certa — e foi esse juiz que acusou a chave quebrada.

**A soma com o espelho**: trocar as cores é o negativo do jogo, e `P + (−P)` tem de ser de segundo jogador. Jogado nos dois tabuleiros ao mesmo tempo, fecha em todas as 729 posições do 3×2.

---

## O que as medidas me corrigiram

**A chave da memória perdia o bit de quem está na vez.** Escrevi `pretas · 2³² + brancas · 2 + vez`. O JavaScript só guarda inteiros exatos até 2⁵³, e com 22 casas ou mais `pretas · 2³²` passa disso: o passo entre números representáveis vira 2 e o último bit some. A posição com o preto na vez e a com o branco na vez viravam a mesma chave. O que me mostrou foi o 5×5: as quinas (0,0), (4,0) e (4,4) resistiam e a (0,4) não, e as quatro são a mesma quina por simetria.

**O defeito mudou números, não só um.** Com a chave certa: o 5×5 passou de 4 para **5** pedras que resistem e de 26 para **28** pares bons; o 6×4 passou de 11 para **8** pares bons; e o 1×23 e o 1×24, que davam vitória do preto, passaram a dar do branco.

**A minha aposta parecia ter errado, e era o bug.** Escrevi `n ≡ 1 (mod 4)` antes de medir a faixa longa. A primeira rodada voltou com o preto ganhando também em 23 e 24 — e eu cheguei a anotar que a regra quebrava. Eram exatamente os comprimentos com mais de 22 casas. Com a chave certa a regra vale de 5 a 29.

**O 6×5 tinha resposta, e ela não valia nada.** Com a chave quebrada ele "dava branco". Com a certa, ele estoura o `Map` do JavaScript em 2²⁴ entradas: a resposta antiga só coube na memória porque a chave juntava posições diferentes. Na tabela ele está como não medido.

O mesmo defeito existia no `clobber` deste acervo. Lá ele não chegou a morder — refiz o 2×11 com chave em texto e deu o mesmo resultado, com os mesmos nós —, e foi corrigido também.

---

## Como usar

Node 20 ou mais novo. Sem dependência.

```bash
npm test
npm run medir
node ferramentas/medidor.js sete
node exemplos/uso.js 5 5
```

```js
import { resolve } from 'konane'

resolve(5, 5).pedrasBoas   // [[0,0], [0,4], [2,2], [4,0], [4,4]]
```

## Os arquivos

- `src/konane.js` — as regras, os pulos, a chave da memória e o motor.
- `src/juiz.js` — o motor sem memória, a soma com o espelho e a simetria das aberturas.
- `src/medidas.js` — as tabelas do README, cada uma calculada uma vez só.
- `src/index.js` — a porta de entrada do pacote.
- `exemplos/uso.js` — o pacote em uso.
- `ferramentas/medidor.js` — imprime as tabelas.
- `testes/` — 17 testes, com os números do README presos.

## Licença

MIT.
