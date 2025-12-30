// Declarar o tipo para window.__env
declare global {
  interface Window {
    __env?: {
      apiUrl?: string;
      production?: string;
      logLevel?: string;
    };
  }
}

export const environment = {
  production: (window as any).__env?.production === 'true' || true,
  apiUrl: (window as any).__env?.apiUrl || 'https://api.preceba.com/api',
  logLevel: (window as any).__env?.logLevel || 'info',
  enableLogging: true,
  appName: 'Angular Observability Demo',
  version: '1.0.0'
};
