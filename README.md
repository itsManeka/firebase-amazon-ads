# 🛍️ Firebase Amazon Ads API

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin%20SDK-orange.svg)](https://firebase.google.com/)
[![Amazon PAAPI](https://img.shields.io/badge/Amazon-PAAPI%205.0-yellow.svg)](https://webservices.amazon.com/paapi5/)

API robusta e eficiente que integra **Firebase Firestore** com **Amazon Product Advertising API (PAAPI 5.0)** para buscar, armazenar e gerenciar informações de produtos da Amazon com sistema inteligente de cache.

## ✨ Características

- 🚀 **Performance otimizada** com cache inteligente (24h de duração)
- 🔒 **Segurança** com validação rigorosa de parâmetros e CORS configurável
- 📊 **Monitoramento** com health checks e logs detalhados
- 🛡️ **Tratamento de erros** robusto com diferentes códigos de status
- 📝 **Documentação completa** com JSDoc em todo o código
- 🔧 **Ambiente flexível** com configurações para desenvolvimento e produção
- 💾 **Cache inteligente** que reduz custos e melhora velocidade de resposta

## 🏗️ Arquitetura

```
firebase-amazon-ads/
├── 📁 routes/
│   └── amazon-products.js     # Rotas da API com cache inteligente
├── 📄 index.js                # Servidor Express principal
├── 📄 firebase.js             # Configuração Firebase Admin SDK
├── 📄 paapi.js                # Integração Amazon PAAPI 5.0
├── 📄 package.json            # Dependências e scripts
├── 📄 README.md               # Este arquivo
└── 📄 .env                    # Variáveis de ambiente (criar)
```

### 🧩 Componentes principais

| Arquivo | Responsabilidade |
|---------|------------------|
| **`index.js`** | Servidor Express, middlewares, CORS, health checks e graceful shutdown |
| **`firebase.js`** | Inicialização do Firebase Admin SDK com validações robustas |
| **`paapi.js`** | Integração completa com Amazon PAAPI 5.0 e formatação de dados |
| **`routes/amazon-products.js`** | Endpoints da API com sistema de cache inteligente |

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 16.0.0 ou superior
- **Conta Firebase** com projeto configurado
- **Credenciais Amazon PAAPI 5.0** (Associates Program)

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/itsManeka/firebase-amazon-ads.git
cd firebase-amazon-ads

# Instale as dependências
npm install

# Para desenvolvimento (opcional)
npm install -g nodemon
```

### 2. Configuração de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Configurações Firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_PROJECT_ID="seu-projeto-firebase"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com"

# Configurações CORS
URL_LOCAL="http://localhost:3000"
URL_OFICIAL="https://seusite.com"

# Credenciais Amazon PAAPI 5.0
AMAZON_ACCESS_KEY="sua-access-key"
AMAZON_SECRET_KEY="sua-secret-key"
AMAZON_PARTNER_TAG="seu-associate-tag"

# Configurações opcionais
NODE_ENV="development"
PORT="3000"
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env`! Certifique-se de que está no `.gitignore`.

### 3. Execução

```bash
# Produção
npm start

# Desenvolvimento (com auto-reload)
npm run dev

# Verificação de funcionamento
curl http://localhost:3000/health
```

## 📚 API Reference

### 🔍 Busca de Produtos

**Endpoint:** `GET /amazon-products/search`

Busca produtos na Amazon com cache inteligente. Retorna dados do cache se disponíveis (< 24h), caso contrário busca na API da Amazon.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição | Padrão | Limite |
|-----------|------|-------------|-----------|---------|---------|
| `query` | string | ✅ | Palavras-chave para busca | - | - |
| `itemCount` | number | ❌ | Número de produtos retornados | 10 | 1-50 |

#### Exemplos de Uso

```bash
# Busca básica
curl "http://localhost:3000/amazon-products/search?query=smartphone"

# Busca com número específico de itens
curl "http://localhost:3000/amazon-products/search?query=notebook%20gamer&itemCount=20"

# Busca com caracteres especiais (URL encoded)
curl "http://localhost:3000/amazon-products/search?query=caf%C3%A9%20expresso"
```

#### Estrutura de Resposta

```json
{
  "products": [
    {
      "asin": "B08N5WRWNW",
      "url": "https://www.amazon.com.br/dp/B08N5WRWNW",
      "title": "Echo Dot (4ª Geração)",
      "image": "https://m.media-amazon.com/images/I/61BZ4mjOl5L._AC_SL1000_.jpg",
      "price": 249.05,
      "priceFormatted": "R$ 249,05",
      "currency": "BRL",
      "savingBasis": 299.00,
      "savingBasisFormatted": "R$ 299,00",
      "isPrimeEligible": true,
      "availability": "Available",
      "brand": "Amazon",
      "manufacturer": "Amazon",
      "model": "B08N5WRWNW"
    }
  ],
  "metadata": {
    "source": "cache", // ou "amazon_api"
    "cachedAt": "2024-01-15T10:30:00.000Z", // se do cache
    "searchedAt": "2024-01-15T10:30:00.000Z", // se da API
    "itemCount": 10,
    "query": "smartphone",
    "processingTime": "45ms"
  }
}
```

### 🏥 Health Check

**Endpoint:** `GET /health`

Verifica status geral da aplicação.

```bash
curl http://localhost:3000/health
```

**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.123,
  "version": "1.0.0"
}
```

**Endpoint:** `GET /amazon-products/health`

Verifica status específico do serviço de produtos Amazon.

```bash
curl http://localhost:3000/amazon-products/health
```

### 🗑️ Limpeza de Cache (Desenvolvimento)

**Endpoint:** `DELETE /amazon-products/cache/:query`

Remove dados específicos do cache. Disponível apenas em `NODE_ENV=development`.

```bash
curl -X DELETE "http://localhost:3000/amazon-products/cache/smartphone?itemCount=10"
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente Opcionais

```bash
# Ambiente de execução
NODE_ENV="production"          # ou "development"

# Configuração de porta
PORT="3000"

# Cache personalizado (em routes/amazon-products.js)
CACHE_DURATION_HOURS="24"      # Duração do cache em horas
```

### Configuração Firebase

1. Acesse o [Console Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Vá em **Configurações do Projeto > Contas de serviço**
4. Clique em **Gerar nova chave privada**
5. Salve o arquivo JSON e extraia as informações para o `.env`

### Configuração Amazon PAAPI 5.0

1. Cadastre-se no [Amazon Associates](https://affiliate-program.amazon.com/)
2. Aguarde aprovação do programa
3. Acesse [Product Advertising API](https://webservices.amazon.com/paapi5/)
4. Gere suas credenciais de acesso
5. Configure as variáveis no `.env`

## 🚀 Deploy

### Heroku

```bash
# Configure as variáveis de ambiente
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
heroku config:set FIREBASE_PROJECT_ID="seu-projeto"
# ... outras variáveis

# Deploy
git push heroku main
```

### Docker

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
```

```bash
docker build -t firebase-amazon-ads .
docker run -p 3000:3000 --env-file .env firebase-amazon-ads
```

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
npm start          # Executa em produção
npm run dev        # Executa com nodemon (desenvolvimento)
npm test          # Executa testes (configurar)
```

### Estrutura de Logs

A aplicação fornece logs detalhados com emojis para fácil identificação:

- 🚀 Inicialização do servidor
- ✅ Operações bem-sucedidas
- 🔍 Operações de busca
- 💾 Operações de cache
- ⚠️ Avisos
- ❌ Erros

### Debugging

Defina `NODE_ENV=development` para:
- Logs mais detalhados
- Endpoint de limpeza de cache
- Stack traces completos nos erros

## 📊 Performance

### Cache Inteligente

- **Duração**: 24 horas por padrão
- **Chave**: Baseada em query normalizada + itemCount
- **Benefícios**: 
  - Reduz chamadas à API da Amazon (economia de custos)
  - Resposta até 10x mais rápida
  - Menor latência para usuários

### Otimizações

- Validação de parâmetros antes de qualquer operação
- Fire-and-forget para operações de cache
- Graceful shutdown para evitar perda de dados
- Middleware de compressão (recomendado para produção)

## 🐛 Troubleshooting

### Erros Comuns

1. **Firebase Admin SDK initialization error**
   - Verifique se todas as variáveis `FIREBASE_*` estão corretas
   - Confirme formato da `FIREBASE_PRIVATE_KEY` (com `\n`)

2. **Amazon PAAPI errors**
   - Verifique credenciais `AMAZON_*`
   - Confirme se Associate Tag está aprovado
   - Verifique limites de requisições da API

3. **CORS errors**
   - Configure `URL_LOCAL` e `URL_OFICIAL` corretamente
   - Teste com Postman para verificar se é problema de CORS

### Logs de Debug

```bash
# Habilitar logs detalhados
NODE_ENV=development npm start

# Verificar conexões
curl http://localhost:3000/health
curl http://localhost:3000/amazon-products/health
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 👤 Autor

**Emanuel Ozorio**

- GitHub: [@itsManeka](https://github.com/itsManeka)
- Email: [emanuel.ozoriodias@gmail.com](mailto:emanuel.ozoriodias@gmail.com)

---

<div align="center">

**Se este projeto foi útil, considere dar uma ⭐!**

</div>