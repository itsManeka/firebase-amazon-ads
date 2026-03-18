---
name: add-endpoint
description: Cria novo endpoint na API amazon-ads
disable-model-invocation: true
argument-hint: "<metodo> <rota>"
---

Crie um novo endpoint na firebase-amazon-ads.

Argumentos: $ARGUMENTS

## Checklist

1. Handler com validacao de auth (Firebase Admin)
2. Service usando PA-API
3. Cache em Firestore se aplicavel
4. Rota no Express router
5. Testes com mocks
