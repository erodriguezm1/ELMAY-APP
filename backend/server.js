const express = require('express');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // El puerto del servidor, usa el de .env o 5000 por defecto

// Middleware para parsear JSON (para que Express entienda los datos JSON que le envíe el frontend)
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API de ELMAY funcionando!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Accede desde tu navegador: http://localhost:${PORT}`);
});