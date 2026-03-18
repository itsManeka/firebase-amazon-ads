# firebase-amazon-ads

API de produtos Amazon contextuais para o Open Tarot. Express + Firebase Admin + PAAPI 5.0.

## Stack

- Express.js com TypeScript
- Firebase Admin SDK (auth, Firestore)
- Amazon Product Advertising API 5.0 (PAAPI)
- Firebase Functions (deploy)

## Funcionalidades

- Busca de produtos Amazon por keywords
- Produtos contextuais baseados em leituras de tarot
- Cache de resultados em Firestore

## PA-API

- `paapi5-nodejs-sdk` para chamadas
- Credenciais: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG`
- Rate limiting: respeitar limites da API
- Batch: ate 10 itens por request

## Comandos

```bash
npm install
npm run dev
npm run build
npm test
firebase deploy --only functions
```

## Deploy

Firebase Functions via `firebase deploy --only functions`.
