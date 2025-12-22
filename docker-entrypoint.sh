#!/bin/sh

# Substitui as variáveis de ambiente no template e gera o env.js
envsubst '${NG_APP_API_URL} ${NG_APP_PRODUCTION} ${NG_APP_LOG_LEVEL}' < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

# Inicia o Nginx
nginx -g 'daemon off;'
