---
name: firebase-deploy
description: Deploy do amazon-ads para Firebase Functions
disable-model-invocation: true
---

Deploy do firebase-amazon-ads para Firebase Functions.

## Processo

1. Build: `npm run build`
2. Deploy: `firebase deploy --only functions`
3. Verificar logs: `firebase functions:log`
