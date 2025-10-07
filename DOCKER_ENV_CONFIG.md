# Configuración de Variables de Entorno en Docker

Esta aplicación soporta configuración dinámica de credenciales de Supabase en runtime mediante variables de entorno.

## 🚀 Uso con docker-compose

### 1. Editar `docker-compose.yaml`

Modifica las variables de entorno en la sección `environment`:

```yaml
environment:
  VITE_SUPABASE_URL: "https://tu-instancia.supabase.co"
  VITE_SUPABASE_ANON_KEY: "tu-anon-key-aqui"
```

### 2. Levantar el contenedor

```bash
docker-compose up -d
```

## 🐳 Uso con Docker CLI

```bash
docker build -t analytics-pro .

docker run -d \
  --name analytics-pro \
  -p 80:80 \
  -e VITE_SUPABASE_URL="https://tu-instancia.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="tu-anon-key-aqui" \
  analytics-pro
```

## 📦 Uso con Portainer

### Método 1: Stack (Recomendado)

1. Ve a **Stacks** > **Add stack**
2. Pega el contenido de `docker-compose.yaml`
3. **Edita las variables de entorno** en la sección `environment`
4. Click en **Deploy the stack**

### Método 2: Desde imagen pre-construida

1. Ve a **Containers** > **Add container**
2. Nombre: `analytics-pro`
3. Image: `tu-registro/analytics-pro:latest`
4. En **Advanced container settings** > **Env**:
   - Agregar variable: `VITE_SUPABASE_URL` = `https://tu-instancia.supabase.co`
   - Agregar variable: `VITE_SUPABASE_ANON_KEY` = `tu-anon-key-aqui`
5. Port mapping: `80:80`
6. Click **Deploy the container**

## 🔄 Cambiar credenciales sin rebuild

### Con docker-compose:
```bash
# 1. Editar docker-compose.yaml con nuevas credenciales
# 2. Recrear el contenedor
docker-compose up -d --force-recreate
```

### Con Portainer:
1. Detener el contenedor
2. **Duplicate/Edit** > **Env** > Modificar variables
3. **Deploy the container**

### Con Docker CLI:
```bash
docker stop analytics-pro
docker rm analytics-pro
docker run -d \
  --name analytics-pro \
  -p 80:80 \
  -e VITE_SUPABASE_URL="https://nueva-instancia.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="nuevo-anon-key" \
  analytics-pro
```

## 🔍 Verificar configuración activa

```bash
# Ver logs del contenedor
docker logs analytics-pro

# Deberías ver:
# Generando configuración desde variables de entorno...
# Configuración generada exitosamente:
#   VITE_SUPABASE_URL: https://tu-instancia.supabase.co
#   VITE_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiI...
# Iniciando Nginx...
```

## 🛠️ Troubleshooting

### El contenedor no inicia
```bash
# Ver logs detallados
docker logs analytics-pro

# Verificar que el script tiene permisos
docker exec analytics-pro ls -la /docker-entrypoint.d/
```

### La aplicación no se conecta a Supabase
1. Verificar que las variables de entorno están configuradas:
   ```bash
   docker exec analytics-pro cat /usr/share/nginx/html/env-config.js
   ```

2. Verificar en el navegador (DevTools > Console):
   ```javascript
   console.log(window.ENV_CONFIG)
   ```

### Las credenciales no se actualizan
- Asegúrate de **recrear** el contenedor, no solo reiniciarlo
- El script `env-config.sh` se ejecuta solo al **iniciar** el contenedor

## 📝 Variables de entorno disponibles

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL de tu instancia Supabase | ✅ Sí |
| `VITE_SUPABASE_ANON_KEY` | Anon/Public Key de Supabase | ✅ Sí |

## 🔐 Seguridad

- ⚠️ Nunca commitear credenciales reales en `docker-compose.yaml`
- ✅ Usar archivos `.env` o secrets de Portainer/Docker Swarm en producción
- ✅ El `ANON_KEY` es público y puede estar en el código - RLS protege los datos
- ❌ Nunca exponer el `SERVICE_ROLE_KEY` en el frontend

## 📚 Más información

- Supabase project ID se mantiene en `supabase/config.toml`
- Edge functions requieren actualizar su configuración separadamente
- Para desarrollo local, usar archivo `.env` en la raíz del proyecto
