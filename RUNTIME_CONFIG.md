# Runtime Environment Configuration - Guia de Uso

## 📋 Como Funciona

Esta configuração permite alterar variáveis de ambiente **sem rebuildar a imagem Docker**. 

### Arquitetura da Solução

1. **Template (`src/assets/env.template.js`)**: Arquivo com placeholders `${VAR_NAME}`
2. **Entrypoint Script (`docker-entrypoint.sh`)**: Substitui placeholders com valores reais
3. **Carregamento (`index.html`)**: Carrega `env.js` antes do Angular iniciar
4. **Uso (`environment.ts`)**: Lê valores de `window.__env`

## 🚀 Como Usar

### Build da Imagem
```bash
docker build -t angular-observability-demo .
```

### Executar com Variáveis Padrão
```bash
docker run -p 8080:80 angular-observability-demo
```

### Executar com Variáveis Customizadas
```bash
docker run -p 8080:80 \
  -e NG_APP_API_URL=https://api.staging.com/api \
  -e NG_APP_PRODUCTION=false \
  -e NG_APP_LOG_LEVEL=debug \
  angular-observability-demo
```

### Com Docker Compose
```yaml
version: '3.8'
services:
  app:
    image: angular-observability-demo
    ports:
      - "8080:80"
    environment:
      - NG_APP_API_URL=https://api.staging.com/api
      - NG_APP_PRODUCTION=false
      - NG_APP_LOG_LEVEL=debug
```

## 🔧 Variáveis Disponíveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `NG_APP_API_URL` | `https://api.preceba.com/api` | URL da API backend |
| `NG_APP_PRODUCTION` | `true` | Modo de produção |
| `NG_APP_LOG_LEVEL` | `error` | Nível de log (error, warn, info, debug) |

## ➕ Adicionar Novas Variáveis

### 1. Adicione no template
```javascript
// src/assets/env.template.js
window.__env.minhaNovaVar = '${NG_APP_MINHA_VAR}';
```

### 2. Atualize o entrypoint
```bash
# docker-entrypoint.sh
envsubst '${NG_APP_API_URL} ${NG_APP_MINHA_VAR}' < ...
```

### 3. Defina valor padrão no Dockerfile
```dockerfile
ENV NG_APP_MINHA_VAR=valor_padrao
```

### 4. Use no environment.ts
```typescript
export const environment = {
  minhaNovaVar: (window as any).__env?.minhaNovaVar || 'fallback',
  // ...
};
```

## ✅ Vantagens

- ✨ **Sem rebuild**: Altere configurações sem rebuildar a imagem
- 🚀 **Deploy ágil**: Mesma imagem para dev, staging e produção
- 🔒 **Segurança**: Variáveis sensíveis não ficam no código
- 🎯 **Simplicidade**: Padrão claro e fácil de manter

## 📝 Notas Importantes

- As variáveis são substituídas no **container start**
- O arquivo `env.template.js` é o template, `env.js` é gerado em runtime
- Sempre use valores padrão (fallback) no `environment.ts`
- Teste localmente antes de fazer deploy
