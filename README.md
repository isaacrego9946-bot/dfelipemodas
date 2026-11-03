# D Felipe Modas

Loja de roupas com vitrine, carrinho, pedidos e painel do lojista.

## Como rodar

```bash
npm install
npm run dev -- --port 43123
```

Abra [http://127.0.0.1:43123](http://127.0.0.1:43123). O acesso do lojista fica no rodapé da loja, no link Painel.

## O que o painel faz

- Cadastra peças com preço, categoria e tamanhos de P a GG, ou numeração de 37 a 42. Acessórios usam tamanho único.
- Recebe fotos do computador, inclusive imagens salvas do WhatsApp.
- Guarda os pedidos feitos na vitrine. Não há cobrança: o checkout só registra o pedido.
- Mostra cada pedido, muda o status e imprime o comprovante.
- Resume os relatórios por período: quantidade de pedidos, faturamento, ticket médio e peças mais vendidas.
- Guarda o nome da loja, o WhatsApp e um backup em JSON.

Os dados de quem compra ficam protegidos pela senha do painel. Exporte um backup em Ajustes. A cópia online de teste permanece disponível por cerca de 7 dias a partir de 2 de novembro de 2026.

## Endereço público

A loja que grava pedidos está em [https://fleet-opal-g0w5l4c.tmp.now](https://fleet-opal-g0w5l4c.tmp.now). O endereço antigo do GitHub Pages encaminha para ela. Esse endereço de demonstração expira se ninguém reivindicar a publicação na Vercel.
