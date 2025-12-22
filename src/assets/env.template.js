(function (window) {
    window.__env = window.__env || {};

    // Essas variáveis serão substituídas em runtime pelo script do Docker
    window.__env.apiUrl = '${NG_APP_API_URL}';
    window.__env.production = '${NG_APP_PRODUCTION}';
    window.__env.logLevel = '${NG_APP_LOG_LEVEL}';
})(this);
