#!/bin/bash

# Este script realiza un respaldo (dump) de la base de datos MongoDB y lo comprime.

# --- CONFIGURACIÓN ---
# La base de datos a respaldar (debe coincidir con la usada en MONGO_URI)
DB_NAME="ecommerce" 
# El nombre de la carpeta de respaldo que se creará localmente
BACKUP_DIR="./backups"
# El nombre del contenedor de la base de datos (según docker-compose.yml)
MONGO_CONTAINER="elmay-mongodb"
# Credenciales de autenticación (deben coincidir con el servicio mongo)
MONGO_USER="admin"
MONGO_PASS="password"
# ---------------------

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_PATH="/tmp/dump_data" # Carpeta temporal dentro del contenedor
BACKUP_FILE="$BACKUP_DIR/mongo_backup_$TIMESTAMP.tar.gz"

echo "=========================================="
echo "Iniciando respaldo de MongoDB ($DB_NAME)..."
echo "=========================================="

# 1. Crear la carpeta de backups local si no existe
mkdir -p "$BACKUP_DIR"

# 2. Ejecutar mongodump DENTRO del contenedor
echo "-> Generando dump de la base de datos '$DB_NAME'..."

docker exec "$MONGO_CONTAINER" mongodump \
  --db="$DB_NAME" \
  --username="$MONGO_USER" \
  --password="$MONGO_PASS" \
  --authenticationDatabase="admin" \
  --out="$DUMP_PATH"

# Verificar si mongodump fue exitoso
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Falló la ejecución de mongodump. Asegúrate de que el contenedor esté corriendo y las credenciales sean correctas."
  exit 1
fi

# 3. Comprimir y transferir el dump a tu carpeta local
echo "-> Comprimiendo y moviendo el respaldo a: $BACKUP_FILE"

# Comprime la carpeta de dump generada y la saca del contenedor
docker exec "$MONGO_CONTAINER" tar -czf - -C "$DUMP_PATH" "$DB_NAME" > "$BACKUP_FILE"

# 4. Limpiar la carpeta temporal dentro del contenedor
echo "-> Limpiando archivos temporales en el contenedor..."
docker exec "$MONGO_CONTAINER" rm -rf "$DUMP_PATH"

echo "✅ Respaldo completado exitosamente."
echo "=========================================="
