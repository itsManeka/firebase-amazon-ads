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

## Design de Seguranca

### Endpoint publico por design

O endpoint `/amazon-products/search` e publico por design — serve cache de anuncios contextuais sem necessidade de identificar o usuario. Escrita no Firestore e feita exclusivamente via Firebase Admin SDK (service account), que bypassa Security Rules. Nao ha autenticacao de usuario neste servico.

Isso e intencional: anuncios contextuais sao conteudo publico e nao requerem sessao. A seguranca da escrita no Firestore e garantida pelo Firebase Admin SDK (privilegio de service account), nao por Security Rules de usuario.
