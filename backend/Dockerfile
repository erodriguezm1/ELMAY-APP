# ELMAY-APP/backend/Dockerfile
# Usa una imagen base de Node.js 18 (la version que se usara DENTRO del contenedor)
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json (o yarn.lock)
# primero para aprovechar la cache de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del codigo de la aplicacion
COPY . .

# Expone el puerto en el que la aplicacion Express estare escuchando
EXPOSE 5000

# Define el comando para iniciar la aplicacion cuando el contenedor arranque
# Usaremos "npm start" que definimos en package.json (node server.js)
CMD ["npm", "start"]