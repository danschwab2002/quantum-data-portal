# Etapa de build
FROM node:18-alpine AS builder

# Define argumentos de build para variables de entorno de Vite
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Configura variables de entorno para build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./

# Instala dependencias (npm ci es más rápido y determinista)
RUN npm ci

# Copia el resto del código fuente
COPY . .

# Genera el build de producción
RUN npm run build

# Etapa de runtime
FROM nginx:stable-alpine

# Copia los archivos compilados desde la etapa de build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la configuración personalizada de Nginx para SPA routing y cache
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expone puerto 80
EXPOSE 80

# Health check para asegurar que Nginx está sirviendo contenido
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Inicia Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
