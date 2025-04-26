# Firebase Amazon Ads

Este projeto é uma API que integra o Firebase Firestore e a API de Produtos da Amazon (PAAPI 5.0) para buscar e armazenar informações de produtos da Amazon com base em palavras-chave.

## Estrutura do Projeto

```
.
├── .env
├── .gitignore
├── firebase.js
├── index.js
├── paapi.js
├── package.json
├── routes/
│   └── amazon-products.js
```

### Arquivos principais

- **`index.js`**: Configura o servidor Express, define as rotas e gerencia o CORS.
- **`firebase.js`**: Configura o Firebase Admin SDK para acessar o Firestore.
- **`paapi.js`**: Implementa a integração com a API de Produtos da Amazon (PAAPI 5.0).
- **`routes/amazon-products.js`**: Define a rota `/amazon-products/search` para buscar produtos da Amazon.

## Pré-requisitos

- Node.js (v16 ou superior)
- Conta no Firebase com um projeto configurado
- Credenciais da API de Produtos da Amazon (PAAPI 5.0)

## Configuração

1. Clone este repositório:

   ```bash
   git clone https://github.com/itsManeka/firebase-amazon-ads.git
   cd firebase-amazon-ads
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis de ambiente:

   ```env
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
   FIREBASE_PROJECT_ID=seu-projeto-id
   FIREBASE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com
   URL_LOCAL=http://localhost:5173
   URL_OFICIAL=https://seu-site.com
   AMAZON_SECRET_KEY=sua-chave-secreta
   AMAZON_PARTNER_TAG=seu-partner-tag
   AMAZON_ACCESS_KEY=sua-access-key
   ```

4. Certifique-se de que o arquivo `.env` está listado no `.gitignore` para evitar o upload de credenciais sensíveis.

## Uso

1. Inicie o servidor:

   ```bash
   node index.js
   ```

2. Acesse a API em `http://localhost:3000`.

### Endpoints

#### `GET /amazon-products/search`

Busca produtos da Amazon com base em uma palavra-chave.

**Parâmetros de consulta:**

- `query` (obrigatório): Palavra-chave para a busca.
- `itemCount` (obrigatório): Número de itens a serem retornados

**Exemplo de requisição:**

```bash
curl "http://localhost:3000/amazon-products/search?query=notebook&itemCount=5"
```

## Dependências

- [Express](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [PAAPI 5.0 Node.js SDK](https://github.com/wusoma/paapi5-nodejs-sdk)
- [dotenv](https://github.com/motdotla/dotenv)
- [cors](https://github.com/expressjs/cors)