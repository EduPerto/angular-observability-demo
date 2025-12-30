# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:alpine

# Instalar gettext para o comando envsubst
RUN apk add --no-cache gettext

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist/angular-observability-demo/browser /usr/share/nginx/html

# Copiar o script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Definir variáveis de ambiente padrão
ENV NG_APP_API_URL=https://api.preceba.com/api
ENV NG_APP_PRODUCTION=true
ENV NG_APP_LOG_LEVEL=info

# OpenTelemetry environment variables
ENV NG_APP_OTEL_ENABLED=true
ENV NG_APP_OTEL_TRACING_ENDPOINT=http://localhost:4318/v1/traces
ENV NG_APP_OTEL_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
ENV NG_APP_OTEL_SAMPLE_RATE=0.1

# Copiar configuração customizada do Nginx (opcional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Usar o script de entrypoint customizado
ENTRYPOINT ["/docker-entrypoint.sh"]
