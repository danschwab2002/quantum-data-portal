#!/bin/sh

# Script para generar configuración en runtime desde variables de entorno
# Este script se ejecuta cada vez que el contenedor inicia

echo "Generando configuración desde variables de entorno..."

# Lee las variables de entorno del sistema
SUPABASE_URL="${VITE_SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"

# Genera el archivo de configuración JavaScript
cat > /usr/share/nginx/html/env-config.js << EOF
// Configuración generada automáticamente en runtime
// NO editar manualmente - este archivo se regenera en cada inicio del contenedor
window.ENV_CONFIG = {
  VITE_SUPABASE_URL: "${SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${SUPABASE_ANON_KEY}"
};
EOF

echo "Configuración generada exitosamente:"
echo "  VITE_SUPABASE_URL: ${SUPABASE_URL}"
echo "  VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:20}..." # Solo mostrar primeros 20 caracteres

# Iniciar Nginx
echo "Iniciando Nginx..."
exec nginx -g 'daemon off;'
