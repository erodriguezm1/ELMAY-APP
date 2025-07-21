# ELMAY/frontend/Dockerfile
# Usa una imagen base de Node.js 18 (la versión que se usará DENTRO del contenedor)
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Limpia la caché de npm antes de instalar para asegurar una instalación limpia
RUN npm cache clean --force

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que la aplicación de Vite se ejecutará en desarrollo
EXPOSE 3000

# Comando para iniciar la aplicación en desarrollo
CMD ["npm", "run", "dev"]