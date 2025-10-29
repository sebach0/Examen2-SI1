#!/bin/bash

# ===========================================
# Script de Verificación Pre-Deployment
# ===========================================
# Ejecutar este script antes de hacer deployment a Azure
# para asegurarte de que todo está configurado correctamente

echo "🔍 Verificando configuración del sistema..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
ISSUES=0

# ===========================================
# 1. Verificar Zona Horaria en Backend
# ===========================================
echo "📅 1. Verificando zona horaria..."

TIMEZONE=$(grep "APP_TIMEZONE" backend/.env | cut -d '=' -f2)

if [ "$TIMEZONE" == "America/La_Paz" ]; then
    echo -e "${GREEN}✓${NC} Zona horaria configurada correctamente: $TIMEZONE"
else
    echo -e "${RED}✗${NC} Zona horaria incorrecta. Debe ser 'America/La_Paz', encontrado: '$TIMEZONE'"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ===========================================
# 2. Verificar Locale en Backend
# ===========================================
echo "🌐 2. Verificando locale..."

LOCALE=$(grep "APP_LOCALE" backend/.env | cut -d '=' -f2)

if [ "$LOCALE" == "es" ]; then
    echo -e "${GREEN}✓${NC} Locale configurado correctamente: $LOCALE"
else
    echo -e "${YELLOW}⚠${NC} Locale no es 'es'. Encontrado: '$LOCALE'"
fi

echo ""

# ===========================================
# 3. Verificar TrustProxies Middleware
# ===========================================
echo "🌐 3. Verificando middleware TrustProxies..."

if [ -f "backend/app/Http/Middleware/TrustProxies.php" ]; then
    echo -e "${GREEN}✓${NC} Archivo TrustProxies.php existe"
    
    if grep -q "protected \$proxies = '\*';" backend/app/Http/Middleware/TrustProxies.php; then
        echo -e "${GREEN}✓${NC} Middleware configurado para aceptar proxies de Azure"
    else
        echo -e "${RED}✗${NC} Middleware no configurado correctamente"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${RED}✗${NC} Archivo TrustProxies.php NO existe"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ===========================================
# 4. Verificar archivo .env.azure.example
# ===========================================
echo "📝 4. Verificando documentación de Azure..."

if [ -f "backend/.env.azure.example" ]; then
    echo -e "${GREEN}✓${NC} Archivo .env.azure.example existe"
else
    echo -e "${RED}✗${NC} Archivo .env.azure.example NO existe"
    ISSUES=$((ISSUES + 1))
fi

if [ -f "DEPLOY_AZURE.md" ]; then
    echo -e "${GREEN}✓${NC} Guía DEPLOY_AZURE.md existe"
else
    echo -e "${RED}✗${NC} Guía DEPLOY_AZURE.md NO existe"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ===========================================
# 5. Verificar React Fragment keys
# ===========================================
echo "⚛️  5. Verificando código React..."

if grep -q "React.Fragment key=" frontend/src/app/bitacora/page.tsx; then
    echo -e "${GREEN}✓${NC} React Fragment con key prop en bitácora"
else
    echo -e "${RED}✗${NC} Falta key prop en React Fragment"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ===========================================
# 6. Verificar Docker containers corriendo
# ===========================================
echo "🐳 6. Verificando Docker containers..."

if docker-compose ps | grep -q "examen2_backend.*Up"; then
    echo -e "${GREEN}✓${NC} Backend container corriendo"
else
    echo -e "${RED}✗${NC} Backend container NO está corriendo"
    ISSUES=$((ISSUES + 1))
fi

if docker-compose ps | grep -q "examen2_postgres.*Up"; then
    echo -e "${GREEN}✓${NC} PostgreSQL container corriendo"
else
    echo -e "${RED}✗${NC} PostgreSQL container NO está corriendo"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ===========================================
# 7. Test de API (health check)
# ===========================================
echo "🏥 7. Verificando health check del backend..."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/up)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓${NC} Health check OK (200)"
else
    echo -e "${RED}✗${NC} Health check falló (HTTP $HTTP_CODE)"
    ISSUES=$((ISSUES + 1))
fi

echo ""

# ===========================================
# 8. Verificar migraciones ejecutadas
# ===========================================
echo "📊 8. Verificando base de datos..."

TABLES=$(docker-compose exec -T postgres psql -U examen2_user -d examen2_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' ')

if [ "$TABLES" -gt 10 ]; then
    echo -e "${GREEN}✓${NC} Base de datos tiene $TABLES tablas (migraciones ejecutadas)"
else
    echo -e "${YELLOW}⚠${NC} Solo se encontraron $TABLES tablas. ¿Migraciones ejecutadas?"
fi

echo ""

# ===========================================
# 9. Verificar que existe al menos 1 usuario
# ===========================================
echo "👤 9. Verificando usuarios en base de datos..."

USERS=$(docker-compose exec -T postgres psql -U examen2_user -d examen2_db -t -c "SELECT COUNT(*) FROM usuarios;" 2>/dev/null | tr -d ' ')

if [ "$USERS" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Existen $USERS usuarios en la base de datos"
else
    echo -e "${YELLOW}⚠${NC} No hay usuarios. Ejecutar: php artisan db:seed --class=UsuariosSeeder"
fi

echo ""

# ===========================================
# 10. Verificar registros en bitácora
# ===========================================
echo "📋 10. Verificando registros en bitácora..."

BITACORA=$(docker-compose exec -T postgres psql -U examen2_user -d examen2_db -t -c "SELECT COUNT(*) FROM bitacora;" 2>/dev/null | tr -d ' ')

if [ "$BITACORA" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Existen $BITACORA registros en bitácora"
    
    # Verificar zona horaria de registros
    LATEST_TIME=$(docker-compose exec -T postgres psql -U examen2_user -d examen2_db -t -c "SELECT created_at AT TIME ZONE 'America/La_Paz' FROM bitacora ORDER BY created_at DESC LIMIT 1;" 2>/dev/null | tr -d ' ')
    echo -e "${GREEN}  ↳${NC} Último registro: $LATEST_TIME (BOT)"
else
    echo -e "${YELLOW}⚠${NC} No hay registros en bitácora. Se crearán al usar la aplicación."
fi

echo ""

# ===========================================
# RESUMEN
# ===========================================
echo "=========================================="
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=========================================="

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ TODO OK!${NC} Sistema listo para deployment a Azure"
    echo ""
    echo "Próximos pasos:"
    echo "1. Revisar DEPLOY_AZURE.md"
    echo "2. Copiar .env.azure.example a .env.azure"
    echo "3. Configurar variables en Azure Portal"
    echo "4. Ejecutar deployment"
else
    echo -e "${RED}✗ ENCONTRADOS $ISSUES PROBLEMAS${NC}"
    echo ""
    echo "Por favor corregir los problemas antes de hacer deployment."
fi

echo "=========================================="

exit $ISSUES
