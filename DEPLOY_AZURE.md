# 🚀 Deployment en Microsoft Azure

Esta guía te ayudará a desplegar el **Sistema de Asistencias** en Microsoft Azure.

## 📋 Índice

- [Arquitectura Recomendada](#arquitectura-recomendada)
- [Prerequisitos](#prerequisitos)
- [Opción 1: Azure App Service (Recomendado)](#opción-1-azure-app-service-recomendado)
- [Opción 2: Azure Container Instances](#opción-2-azure-container-instances)
- [Opción 3: Azure Kubernetes Service (AKS)](#opción-3-azure-kubernetes-service-aks)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Configuración de IP Real del Cliente](#configuración-de-ip-real-del-cliente)
- [Post-Deployment](#post-deployment)
- [Monitoreo y Logging](#monitoreo-y-logging)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura Recomendada

### Producción (Recomendada)

```
Internet → Azure Front Door → Azure App Service (Backend + Frontend)
                             ↓
                    Azure Database for PostgreSQL
                             ↓
                    Azure Cache for Redis (opcional)
```

### Desarrollo/Testing (Económica)

```
Internet → Azure App Service → PostgreSQL en Container
```

---

## ✅ Prerequisitos

1. **Cuenta de Azure** con suscripción activa
2. **Azure CLI** instalado: `az --version`
3. **Git** instalado
4. **Repositorio** en GitHub/Azure DevOps (opcional para CI/CD)

### Instalar Azure CLI (Windows PowerShell)

```powershell
winget install Microsoft.AzureCLI
```

### Login a Azure

```bash
az login
az account set --subscription "Tu-Suscripción"
```

---

## 🎯 Opción 1: Azure App Service (Recomendado)

### Ventajas

✅ Más simple de configurar  
✅ Auto-scaling integrado  
✅ SSL gratuito con dominio .azurewebsites.net  
✅ Deployment desde Git integrado  
✅ Health checks automáticos

### Paso 1: Crear Resource Group

```bash
az group create \
  --name examen2-rg \
  --location eastus
```

### Paso 2: Crear Azure Database for PostgreSQL

```bash
# Flexible Server (Recomendado)
az postgres flexible-server create \
  --resource-group examen2-rg \
  --name examen2-db-server \
  --location eastus \
  --admin-user adminuser \
  --admin-password "TuPasswordSeguro123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15

# Crear base de datos
az postgres flexible-server db create \
  --resource-group examen2-rg \
  --server-name examen2-db-server \
  --database-name examen2_db

# Configurar firewall para permitir Azure Services
az postgres flexible-server firewall-rule create \
  --resource-group examen2-rg \
  --name examen2-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### Paso 3: Crear App Service Plan

```bash
az appservice plan create \
  --name examen2-plan \
  --resource-group examen2-rg \
  --sku B1 \
  --is-linux
```

### Paso 4: Crear Web App para Backend (Laravel)

```bash
az webapp create \
  --resource-group examen2-rg \
  --plan examen2-plan \
  --name examen2-backend \
  --runtime "PHP:8.2" \
  --deployment-local-git
```

### Paso 5: Configurar Variables de Entorno

```bash
# Configurar todas las variables de .env.azure.example
az webapp config appsettings set \
  --resource-group examen2-rg \
  --name examen2-backend \
  --settings \
    APP_NAME="Sistema de Asistencias" \
    APP_ENV=production \
    APP_DEBUG=false \
    APP_TIMEZONE=America/La_Paz \
    APP_LOCALE=es \
    DB_CONNECTION=pgsql \
    DB_HOST=examen2-db-server.postgres.database.azure.com \
    DB_PORT=5432 \
    DB_DATABASE=examen2_db \
    DB_USERNAME=adminuser \
    DB_PASSWORD="TuPasswordSeguro123!" \
    DB_SSLMODE=require \
    LOG_CHANNEL=stack \
    CACHE_STORE=database \
    SESSION_DRIVER=database \
    QUEUE_CONNECTION=database
```

### Paso 6: Deploy del Código

#### Opción A: Git Deployment (Recomendado)

```bash
# Obtener URL del Git remoto
az webapp deployment source config-local-git \
  --resource-group examen2-rg \
  --name examen2-backend

# Agregar remote
git remote add azure https://<deployment-user>@examen2-backend.scm.azurewebsites.net/examen2-backend.git

# Push
cd backend
git push azure main:master
```

#### Opción B: Deployment desde GitHub Actions

Crear `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: "8.2"

      - name: Install Dependencies
        run: |
          cd backend
          composer install --no-dev --optimize-autoloader

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: examen2-backend
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: backend
```

### Paso 7: Ejecutar Migraciones

```bash
# SSH al container
az webapp ssh --resource-group examen2-rg --name examen2-backend

# Dentro del container
cd /home/site/wwwroot
php artisan migrate --force
php artisan db:seed --force
```

### Paso 8: Crear Web App para Frontend (Next.js)

```bash
az webapp create \
  --resource-group examen2-rg \
  --plan examen2-plan \
  --name examen2-frontend \
  --runtime "NODE:20-lts"

# Configurar variables
az webapp config appsettings set \
  --resource-group examen2-rg \
  --name examen2-frontend \
  --settings \
    NEXT_PUBLIC_API_URL=https://examen2-backend.azurewebsites.net/api
```

---

## 🐳 Opción 2: Azure Container Instances

### Ventajas

✅ Deploy rápido de Docker containers  
✅ Más control sobre el ambiente  
✅ Pay-per-second (muy económico para dev/test)

### Paso 1: Build y Push a Azure Container Registry

```bash
# Crear ACR
az acr create \
  --resource-group examen2-rg \
  --name examen2acr \
  --sku Basic

# Login
az acr login --name examen2acr

# Build y push backend
cd backend
az acr build --registry examen2acr --image examen2-backend:latest .

# Build y push frontend
cd ../frontend
az acr build --registry examen2acr --image examen2-frontend:latest .
```

### Paso 2: Deploy Container Instances

```bash
# Backend
az container create \
  --resource-group examen2-rg \
  --name examen2-backend \
  --image examen2acr.azurecr.io/examen2-backend:latest \
  --registry-login-server examen2acr.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --dns-name-label examen2-api \
  --ports 8000 \
  --environment-variables \
    APP_ENV=production \
    DB_HOST=examen2-db-server.postgres.database.azure.com

# Frontend
az container create \
  --resource-group examen2-rg \
  --name examen2-frontend \
  --image examen2acr.azurecr.io/examen2-frontend:latest \
  --registry-login-server examen2acr.azurecr.io \
  --registry-username <username> \
  --registry-password <password> \
  --dns-name-label examen2-app \
  --ports 3000 \
  --environment-variables \
    NEXT_PUBLIC_API_URL=https://examen2-api.eastus.azurecontainer.io:8000/api
```

---

## ☸️ Opción 3: Azure Kubernetes Service (AKS)

### Ventajas

✅ Alta disponibilidad  
✅ Auto-scaling avanzado  
✅ Ideal para múltiples microservicios

### Requisitos

- Mayor costo
- Mayor complejidad
- Recomendado solo para producción a gran escala

```bash
# Crear AKS cluster
az aks create \
  --resource-group examen2-rg \
  --name examen2-aks \
  --node-count 2 \
  --enable-managed-identity \
  --generate-ssh-keys

# Obtener credenciales
az aks get-credentials --resource-group examen2-rg --name examen2-aks

# Aplicar manifiestos de Kubernetes
kubectl apply -f k8s/
```

---

## 🗄️ Configuración de Base de Datos

### Opción 1: Azure Database for PostgreSQL Flexible Server (Recomendado)

**Ventajas:**

- Managed service (sin mantenimiento manual)
- Backups automáticos
- Alta disponibilidad opcional
- Escalable

**Costos aproximados:**

- Tier Burstable B1ms: ~$12-20/mes
- Tier General Purpose: ~$100+/mes

### Opción 2: PostgreSQL en Container Instance

**Ventajas:**

- Más económico para dev/test
- Control total

**Desventajas:**

- Requiere manejo manual de backups
- No recomendado para producción

```bash
az container create \
  --resource-group examen2-rg \
  --name postgres \
  --image postgres:15-alpine \
  --dns-name-label examen2-postgres \
  --ports 5432 \
  --environment-variables \
    POSTGRES_DB=examen2_db \
    POSTGRES_USER=examen2_user \
    POSTGRES_PASSWORD=examen2_password
```

---

## 🔧 Configuración de Variables de Entorno

### Variables CRÍTICAS para Azure

```bash
# APP_KEY: Generar nuevo en producción
php artisan key:generate --show

# APP_TIMEZONE: Hora de Bolivia
APP_TIMEZONE=America/La_Paz

# DB con SSL (requerido en Azure Database for PostgreSQL)
DB_SSLMODE=require

# Confiar en proxies de Azure (ya configurado en código)
# El middleware TrustProxies detecta automáticamente la IP real
```

### Configurar en Azure Portal

1. Ir a **Azure Portal** → Tu App Service
2. Click en **Configuration** → **Application settings**
3. Click **+ New application setting**
4. Agregar cada variable de `.env.azure.example`
5. Click **Save**

### Configurar con Azure CLI

```bash
az webapp config appsettings set \
  --resource-group examen2-rg \
  --name examen2-backend \
  --settings @settings.json
```

Contenido de `settings.json`:

```json
[
  { "name": "APP_NAME", "value": "Sistema de Asistencias" },
  { "name": "APP_ENV", "value": "production" },
  { "name": "APP_TIMEZONE", "value": "America/La_Paz" }
]
```

---

## 🌐 Configuración de IP Real del Cliente

### ⚠️ PROBLEMA: IP incorrecta detrás de proxy

Cuando tu aplicación está detrás de Azure Application Gateway o Load Balancer, Laravel ve la IP del gateway en lugar de la IP real del cliente.

### ✅ SOLUCIÓN: Ya implementada

El sistema ya está configurado para detectar la IP real:

1. **Middleware TrustProxies**: Configurado en `bootstrap/app.php`
2. **Headers soportados**:
   - `X-Forwarded-For`: IP del cliente real
   - `X-Forwarded-Host`: Host original
   - `X-Forwarded-Proto`: Protocolo (http/https)
   - `X-Forwarded-Port`: Puerto original

### Verificación

```php
// En cualquier controller/middleware:
$ip = request()->ip(); // Retorna IP REAL del cliente, no del proxy
```

### Testing local con proxy simulado

```bash
curl -H "X-Forwarded-For: 192.168.1.100" http://localhost:8000/api/test
```

### Azure Application Gateway

Si usas Application Gateway, asegúrate de:

1. Habilitar "X-Forwarded-For" en Backend Settings
2. Configurar Health Probe en `/up`

---

## 📊 Post-Deployment

### 1. Verificar Health Check

```bash
curl https://examen2-backend.azurewebsites.net/up
```

Debe retornar `200 OK`.

### 2. Ejecutar Migraciones

```bash
az webapp ssh --resource-group examen2-rg --name examen2-backend
php artisan migrate --force
php artisan db:seed --force
```

### 3. Verificar Logs

```bash
# Stream logs en tiempo real
az webapp log tail --resource-group examen2-rg --name examen2-backend
```

### 4. Verificar IP Real en Bitácora

1. Iniciar sesión en el sistema
2. Ir a **Bitácora**
3. Verificar que el campo **IP** muestra tu IP pública real (no la del gateway)

Para conocer tu IP pública:

```bash
curl https://api.ipify.org
```

### 5. Configurar Custom Domain (Opcional)

```bash
# Agregar dominio personalizado
az webapp config hostname add \
  --resource-group examen2-rg \
  --webapp-name examen2-backend \
  --hostname www.tu-dominio.com

# Habilitar HTTPS
az webapp config ssl bind \
  --resource-group examen2-rg \
  --name examen2-backend \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

---

## 📈 Monitoreo y Logging

### Azure Application Insights (Recomendado)

```bash
# Crear Application Insights
az monitor app-insights component create \
  --app examen2-insights \
  --location eastus \
  --resource-group examen2-rg

# Obtener instrumentation key
az monitor app-insights component show \
  --app examen2-insights \
  --resource-group examen2-rg \
  --query instrumentationKey
```

Agregar a variables de entorno:

```bash
APPINSIGHTS_INSTRUMENTATIONKEY=tu-instrumentation-key
```

### Ver Logs en Azure Portal

1. Ir a **Azure Portal** → Tu App Service
2. Click en **Log stream**
3. Ver logs en tiempo real

### Descargar Logs

```bash
az webapp log download \
  --resource-group examen2-rg \
  --name examen2-backend \
  --log-file logs.zip
```

---

## 🔍 Troubleshooting

### ❌ Error: "IP siempre es 127.0.0.1"

**Causa**: TrustProxies no configurado correctamente.

**Solución**: Ya está configurado en `bootstrap/app.php`. Verificar que Azure Application Gateway está enviando headers `X-Forwarded-For`.

### ❌ Error: "Timezone diferente en bitácora"

**Causa**: Variable `APP_TIMEZONE` no configurada.

**Solución**:

```bash
az webapp config appsettings set \
  --resource-group examen2-rg \
  --name examen2-backend \
  --settings APP_TIMEZONE=America/La_Paz
```

Luego restart:

```bash
az webapp restart --resource-group examen2-rg --name examen2-backend
```

### ❌ Error: "500 Internal Server Error"

**Debug**:

```bash
# Ver logs
az webapp log tail --resource-group examen2-rg --name examen2-backend

# SSH al container
az webapp ssh --resource-group examen2-rg --name examen2-backend

# Verificar permisos
cd /home/site/wwwroot
chmod -R 775 storage bootstrap/cache
```

### ❌ Error: "SQLSTATE[08006] Could not connect to server"

**Causa**: Firewall de PostgreSQL bloqueando conexión.

**Solución**:

```bash
# Permitir Azure Services
az postgres flexible-server firewall-rule create \
  --resource-group examen2-rg \
  --name examen2-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### ❌ Error: "React errors in Bitácora page"

**Causa**: Falta prop `key` en React.Fragment (ya corregido).

**Verificación**: Buscar en código `<React.Fragment key={...}>`.

---

## 📚 Recursos Adicionales

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/azure/postgresql/)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 💰 Estimación de Costos (USD/mes)

### Configuración Mínima (Dev/Test)

- App Service Plan B1: $13
- PostgreSQL Burstable B1ms: $15
- **Total: ~$30/mes**

### Configuración Producción

- App Service Plan P1V2: $73
- PostgreSQL General Purpose: $120
- Azure Cache for Redis: $17
- Application Insights: $5
- **Total: ~$215/mes**

### Optimización de Costos

- Usar App Service Plan compartido entre backend y frontend
- Azure Reserved Instances (descuento 30-70%)
- Apagar recursos en ambientes de desarrollo fuera de horario laboral

---

## ✅ Checklist Final

Antes de considerar el deployment completo:

- [ ] APP_ENV=production configurado
- [ ] APP_DEBUG=false
- [ ] Nuevo APP_KEY generado
- [ ] Base de datos PostgreSQL funcionando
- [ ] Migraciones ejecutadas
- [ ] Seeders ejecutados (si es necesario)
- [ ] Health check `/up` retorna 200
- [ ] CORS configurado correctamente
- [ ] SSL habilitado
- [ ] Bitácora registra IP real del cliente
- [ ] Bitácora muestra fechas en hora de Bolivia (BOT)
- [ ] Logs configurados y funcionando
- [ ] Application Insights configurado (producción)
- [ ] Backups automáticos habilitados
- [ ] Custom domain configurado (si aplica)
- [ ] Alertas configuradas (producción)

---

## 🎉 ¡Listo!

Tu aplicación ahora está corriendo en Azure con:

- ✅ IP real del cliente detectada correctamente
- ✅ Zona horaria de Bolivia (America/La_Paz)
- ✅ Configuración flexible para local y cloud
- ✅ Logs completos en bitácora
- ✅ SSL automático
- ✅ Escalabilidad lista

**Siguiente paso**: Configurar CI/CD con GitHub Actions o Azure DevOps para deployments automáticos.
