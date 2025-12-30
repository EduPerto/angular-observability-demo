# 🧪 Guia de Teste - OpenTelemetry + Jaeger

## ✅ Pré-requisitos

1. **Jaeger rodando:**
   ```bash
   docker-compose up -d jaeger
   ```

2. **Verificar que Jaeger está acessível:**
   ```bash
   curl http://localhost:4318/v1/traces
   # Deve retornar: HTTP 405 (Method Not Allowed é OK)
   ```

3. **Verificar Jaeger UI:**
   - Abrir: http://localhost:16686
   - Deve mostrar a interface do Jaeger

---

## 🚀 Teste 1: Desenvolvimento Local (npm start)

### Passo 1: Iniciar a aplicação
```bash
npm start
```

### Passo 2: Abrir o navegador
- URL: http://localhost:4200

### Passo 3: Abrir DevTools (F12)
- Ir para aba "Console"
- Deve aparecer:
  ```
  [OpenTelemetry] Initializing...
  [OpenTelemetry] Tracing configured: http://localhost:4318/v1/traces
  [OpenTelemetry] Metrics configured: http://localhost:4318/v1/metrics
  [OpenTelemetry] Initialization complete
  ```

### Passo 4: Gerar traces
1. Clicar no botão **"Test HTTP Request"**
2. Aguardar resposta
3. Verificar console do navegador - não deve ter erros CORS

### Passo 5: Verificar traces no Jaeger
1. Abrir: http://localhost:16686
2. No dropdown "Service", selecionar: **angular-observability-demo**
3. Clicar em **"Find Traces"**
4. Deve aparecer lista de traces
5. Clicar em um trace para ver detalhes:
   - Method: GET
   - URL: https://jsonplaceholder.typicode.com/posts/1
   - Status Code: 200
   - Duration: ~XXXms

---

## 🐳 Teste 2: Docker (Produção)

### ⚠️ IMPORTANTE: Endpoint diferente para Docker

Quando a app roda em Docker, mas você acessa do navegador:
- ❌ **NÃO FUNCIONA**: `http://jaeger:4318` (hostname Docker interno)
- ✅ **FUNCIONA**: `http://localhost:4318` (acessível do navegador)

### Solução: Usar variáveis de ambiente

```bash
# docker-compose.yml
environment:
  - NG_APP_OTEL_TRACING_ENDPOINT=http://localhost:4318/v1/traces
  - NG_APP_OTEL_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
```

### Passo 1: Build e start
```bash
docker-compose build angular-app
docker-compose up -d
```

### Passo 2: Verificar logs
```bash
docker-compose logs -f angular-app
```

### Passo 3: Abrir navegador
- URL: http://localhost:8080

### Passo 4: Verificar DevTools
- Mesmo processo do Teste 1

---

## 🔍 Troubleshooting

### Problema: "Failed to fetch" no console

**Causa**: CORS ou endpoint incorreto

**Solução 1**: Verificar CORS no Jaeger
```bash
docker-compose logs jaeger | grep CORS
```

**Solução 2**: Testar endpoint manualmente
```bash
curl -v http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans":[]}'
```

### Problema: Traces não aparecem no Jaeger

**Verificar:**
1. Service name está correto: `angular-observability-demo`
2. Tempo de busca no Jaeger (últimas 1h, 24h, etc)
3. Console do navegador não tem erros

**Debug:**
```javascript
// No DevTools Console:
localStorage.setItem('debug', 'opentelemetry:*')
```

### Problema: Métricas não exportam

**Lembrar:**
- Métricas são exportadas a cada **60 segundos**
- Aguardar 1 minuto após gerar logs/requests
- Verificar console do navegador para erros

---

## 📊 Métricas Disponíveis

### 1. HTTP Requests Counter
- **Nome**: `http.client.requests`
- **Tipo**: Counter
- **Atributos**: method, status_code, url

### 2. HTTP Latency Histogram
- **Nome**: `http.client.duration`
- **Tipo**: Histogram
- **Unidade**: ms
- **Atributos**: method, status_code

### 3. Logs Counter
- **Nome**: `app.logs`
- **Tipo**: Counter
- **Atributos**: log.level (DEBUG, INFO, WARN, ERROR)

### 4. Log History Size Gauge
- **Nome**: `app.log_history.size`
- **Tipo**: Observable Gauge
- **Descrição**: Tamanho atual do histórico em memória

---

## 🎯 Checklist de Validação

- [ ] Jaeger rodando (http://localhost:16686)
- [ ] Endpoint OTLP respondendo (http://localhost:4318)
- [ ] Aplicação inicia sem erros
- [ ] Console mostra "OpenTelemetry Initialization complete"
- [ ] Requisições HTTP geram traces
- [ ] Traces aparecem no Jaeger UI
- [ ] Service name correto: "angular-observability-demo"
- [ ] Spans contêm atributos (method, url, status_code)
- [ ] Erros HTTP registrados como exceptions
- [ ] Métricas exportam após 60s

---

## 🔄 Configurações Úteis

### Desabilitar OpenTelemetry
```typescript
// environment.ts
otel: { enabled: false }
```

### Ajustar Sample Rate
```typescript
// environment.development.ts
tracing: {
  sampleRate: 0.5  // 50% dos traces
}
```

### Aumentar intervalo de métricas
```typescript
// environment.ts
metrics: {
  exportIntervalMillis: 30000  // 30 segundos
}
```

---

## 📚 Recursos Adicionais

- **Jaeger UI**: http://localhost:16686
- **OTLP Traces Endpoint**: http://localhost:4318/v1/traces
- **OTLP Metrics Endpoint**: http://localhost:4318/v1/metrics
- **Jaeger Docs**: https://www.jaegertracing.io/docs/
- **OpenTelemetry JS**: https://opentelemetry.io/docs/instrumentation/js/
