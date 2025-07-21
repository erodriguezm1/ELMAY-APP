# ELMAY-APP/backend/Dockerfile
# Usa una imagen base de Node.js 18 (la versión que se usará DENTRO del contenedor)
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json (o yarn.lock)
# primero para aprovechar la caché de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que la aplicación Express estará escuchando
EXPOSE 5000

# Define el comando para iniciar la aplicación cuando el contenedor arranque
# Usaremos "npm start" que definimos en package.json (node server.js)
CMD ["npm", "start"]