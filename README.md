# Angular Observability Demo

Sistema simples em Angular 20 para testar logging, observabilidade e variáveis de ambiente.

## Funcionalidades Implementadas

### 1. Sistema de Logging
- **LoggerService** com diferentes níveis de log (DEBUG, INFO, WARN, ERROR)
- Logs coloridos no console do navegador
- Histórico de logs em memória (últimas 100 entradas)
- Configuração de nível de log via variáveis de ambiente

### 2. Observabilidade
- **HTTP Interceptor** que registra todas as requisições HTTP
- Captura de tempo de resposta das requisições
- Logging de erros HTTP com detalhes completos
- **Global Error Handler** para capturar erros não tratados da aplicação

### 3. Variáveis de Ambiente
- Configuração separada para Development e Production
- Variáveis configuráveis:
  - `production`: Indica se é ambiente de produção
  - `apiUrl`: URL da API
  - `logLevel`: Nível de log (debug, info, warn, error)
  - `enableLogging`: Habilita/desabilita logging
  - `appName`: Nome da aplicação
  - `version`: Versão da aplicação

## Estrutura do Projeto

```
src/
├── app/
│   ├── interceptors/
│   │   └── logging.interceptor.ts        # Interceptor HTTP para observabilidade
│   ├── services/
│   │   ├── logger.service.ts             # Serviço de logging
│   │   └── global-error-handler.service.ts # Handler global de erros
│   ├── app.ts                            # Componente principal
│   ├── app.html                          # Template
│   ├── app.css                           # Estilos
│   └── app.config.ts                     # Configuração da aplicação
├── environments/
│   ├── environment.ts                    # Ambiente de produção
│   └── environment.development.ts        # Ambiente de desenvolvimento
└── main.ts
```

## Como Usar

### Instalação

```bash
cd angular-observability-demo
npm install
```

### Executar em Modo Development

```bash
npm start
# ou
ng serve
```

Acesse: http://localhost:4200

### Executar em Modo Production

```bash
ng serve --configuration=production
```

### Build para Production

```bash
npm run build
# ou
ng build
```

## Testar as Funcionalidades

Abra a aplicação no navegador e:

1. **Testar Logs**:
   - Clique nos botões "Test DEBUG Log", "Test INFO Log", etc.
   - Observe os logs formatados no console do navegador (F12)
   - Veja o histórico de logs aparecer na página

2. **Testar HTTP Interceptor**:
   - Clique em "Test HTTP Request"
   - Observe no console as informações da requisição HTTP
   - Veja o tempo de resposta e os dados da requisição

3. **Testar Global Error Handler**:
   - Clique em "Test Error Handler"
   - Um erro será lançado intencionalmente
   - Observe como o erro é capturado e registrado

4. **Verificar Variáveis de Ambiente**:
   - Na página, você verá todas as variáveis de ambiente carregadas
   - Altere entre development e production para ver as diferenças

## Configuração de Variáveis de Ambiente

### Development (`src/environments/environment.development.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  logLevel: 'debug',
  enableLogging: true,
  appName: 'Angular Observability Demo',
  version: '1.0.0'
};
```

### Production (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.production.com/api',
  logLevel: 'error',
  enableLogging: true,
  appName: 'Angular Observability Demo',
  version: '1.0.0'
};
```

## Uso do Logger no Código

```typescript
import { LoggerService } from './services/logger.service';

constructor(private logger: LoggerService) {}

// Debug
this.logger.debug('Debug message', { data: 'some data' }, 'ComponentName');

// Info
this.logger.info('Info message', { userId: 123 }, 'ComponentName');

// Warning
this.logger.warn('Warning message', { warning: 'details' }, 'ComponentName');

// Error
this.logger.error('Error message', { error: 'details' }, 'ComponentName');
```

## Recursos

- Angular CLI: 20.2.2
- Angular: 20.2.0
- Node: 20.19.0
- TypeScript: 5.9.2

## Próximos Passos

- Integrar com ferramentas de APM (Application Performance Monitoring)
- Adicionar suporte para envio de logs para serviços externos (Datadog, New Relic, etc.)
- Implementar métricas de performance
- Adicionar correlação de logs com trace IDs
- Criar dashboards de observabilidade

## Licença

MIT
