# Azure Deployment Guide

Guía paso a paso para desplegar tu aplicación en una VM de Azure.

## 🌐 Preparación en Azure Portal

### 1. Crear una Máquina Virtual

1. Inicia sesión en [Azure Portal](https://portal.azure.com)
2. Busca "Virtual Machines" y haz clic en "Create"
3. Configuración recomendada:
   - **Imagen**: Ubuntu Server 22.04 LTS
   - **Tamaño**: Standard B2s o superior (2 vCPUs, 4 GB RAM)
   - **Autenticación**: SSH public key
   - **Puertos entrantes**: HTTP (80), HTTPS (443), SSH (22)

### 2. Configurar Network Security Group

Asegúrate de tener los siguientes puertos abiertos:

| Puerto | Protocolo | Servicio             |
| ------ | --------- | -------------------- |
| 22     | TCP       | SSH                  |
| 80     | TCP       | HTTP                 |
| 443    | TCP       | HTTPS                |
| 3000   | TCP       | Next.js (desarrollo) |
| 8000   | TCP       | Laravel (desarrollo) |

### 3. Configurar DNS (Opcional)

1. En Azure Portal, ve a tu VM
2. Configuración → DNS name label
3. Asigna un nombre único: `tu-app.eastus.cloudapp.azure.com`

## 🔧 Configuración del Servidor

### Paso 1: Conectarse a la VM

```bash
# Desde tu computadora local
ssh azureuser@<tu-ip-publica>
```

### Paso 2: Actualizar el sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### Paso 3: Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version

# Cerrar sesión y volver a conectar para aplicar cambios de grupo
exit
```

### Paso 4: Instalar Git

```bash
ssh azureuser@<tu-ip-publica>
sudo apt install git -y
```

### Paso 5: Configurar Git

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

## 📦 Desplegar la Aplicación

### Paso 1: Clonar el repositorio

```bash
# Clonar tu repositorio
git clone https://github.com/tu-usuario/Examen2-Si1.git
cd Examen2-Si1
```

### Paso 2: Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración de producción
nano .env
```

Configura las siguientes variables para producción:

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=examen2_db
DB_USERNAME=examen2_user
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# API
NEXT_PUBLIC_API_URL=http://tu-dominio.com/api

# Laravel
APP_ENV=production
APP_DEBUG=false
APP_KEY=  # Se generará automáticamente
APP_URL=http://tu-dominio.com
```

### Paso 3: Configurar Laravel

```bash
# Navegar a backend
cd backend

# Crear archivo .env si no existe
cp .env.example .env

# Editar .env
nano .env
```

Configuración para producción:

```env
APP_NAME="Examen2 API"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://tu-dominio.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=examen2_db
DB_USERNAME=examen2_user
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI
```

### Paso 4: Construir y ejecutar

```bash
# Volver a la raíz del proyecto
cd ..

# Construir las imágenes
docker-compose build

# Iniciar los servicios
docker-compose up -d

# Ver los logs
docker-compose logs -f
```

### Paso 5: Ejecutar migraciones

```bash
# Esperar a que los servicios estén listos (30-60 segundos)

# Generar APP_KEY de Laravel
docker-compose exec backend php artisan key:generate

# Ejecutar migraciones
docker-compose exec backend php artisan migrate --force

# Optimizar Laravel para producción
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

## 🔒 Configurar SSL con Let's Encrypt

### Opción 1: Usar Certbot directamente

```bash
# Instalar Certbot
sudo apt install certbot -y

# Detener Nginx temporalmente
docker-compose stop nginx

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Los certificados se guardan en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem
```

### Opción 2: Configurar renovación automática

```bash
# Crear script de renovación
sudo nano /usr/local/bin/renew-cert.sh
```

Contenido del script:

```bash
#!/bin/bash
docker-compose -f /home/azureuser/Examen2-Si1/docker-compose.yml stop nginx
certbot renew
docker-compose -f /home/azureuser/Examen2-Si1/docker-compose.yml start nginx
```

```bash
# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/renew-cert.sh

# Agregar tarea cron
sudo crontab -e
# Agregar esta línea:
0 0 1 * * /usr/local/bin/renew-cert.sh
```

### Actualizar configuración de Nginx para SSL

Edita `nginx/nginx.conf`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Resto de la configuración...
}
```

## 🔄 Actualizar la Aplicación

```bash
# Conectarse a la VM
ssh azureuser@<tu-ip-publica>

# Navegar al proyecto
cd Examen2-Si1

# Obtener últimos cambios
git pull origin main

# Reconstruir servicios
docker-compose down
docker-compose up -d --build

# Ejecutar migraciones si hay nuevas
docker-compose exec backend php artisan migrate --force

# Limpiar caché
docker-compose exec backend php artisan optimize
```

## 📊 Monitoreo y Mantenimiento

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Ver estado de los contenedores

```bash
docker-compose ps
```

### Backup de la base de datos

```bash
# Crear backup
docker-compose exec postgres pg_dump -U examen2_user examen2_db > backup-$(date +%Y%m%d).sql

# Restaurar backup
docker-compose exec -T postgres psql -U examen2_user examen2_db < backup-20231027.sql
```

### Limpiar espacio en disco

```bash
# Eliminar contenedores detenidos
docker container prune -f

# Eliminar imágenes no usadas
docker image prune -a -f

# Eliminar volúmenes no usados
docker volume prune -f
```

## 🛡️ Seguridad

### Configurar firewall

```bash
# Instalar UFW
sudo apt install ufw -y

# Configurar reglas
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

### Cambiar contraseñas por defecto

1. Cambia las contraseñas en `.env`
2. Reinicia los servicios: `docker-compose restart`

### Configurar backups automáticos

```bash
# Crear script de backup
nano ~/backup.sh
```

Contenido:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/home/azureuser/backups"
mkdir -p $BACKUP_DIR

# Backup de base de datos
docker-compose -f /home/azureuser/Examen2-Si1/docker-compose.yml exec -T postgres pg_dump -U examen2_user examen2_db > $BACKUP_DIR/db-$DATE.sql

# Comprimir
gzip $BACKUP_DIR/db-$DATE.sql

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "db-*.sql.gz" -mtime +7 -delete
```

```bash
# Dar permisos
chmod +x ~/backup.sh

# Agregar a cron (diario a las 2 AM)
crontab -e
# Agregar:
0 2 * * * /home/azureuser/backup.sh
```

## 🎯 Verificación Final

Verifica que todo funciona:

1. ✅ Frontend: http://tu-dominio.com
2. ✅ Backend API: http://tu-dominio.com/api/test
3. ✅ SSL (si configurado): https://tu-dominio.com

## 📞 Troubleshooting

### La aplicación no responde

```bash
# Verificar estado
docker-compose ps

# Reiniciar servicios
docker-compose restart

# Ver logs de errores
docker-compose logs --tail=100
```

### Error de base de datos

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Revisar logs
docker-compose logs postgres

# Reiniciar PostgreSQL
docker-compose restart postgres
```

### Error 502 Bad Gateway

```bash
# Verificar que backend esté corriendo
docker-compose logs backend

# Reiniciar nginx
docker-compose restart nginx
```

## 🎉 ¡Listo!

Tu aplicación está desplegada en Azure y lista para producción.
