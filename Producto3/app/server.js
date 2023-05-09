const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { typeDefs, resolvers } = require('./config/config.js');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const http = require('http');
const socketIO = require('socket.io');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'Dashboard.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Nueva ruta POST para manejar la subida de archivos
app.post('/upload', upload.single('file'), (req, res) => {
  // Comprueba si el archivo se subió correctamente
  if (req.file) {
    // Si se subió correctamente, envía una respuesta con el nombre del archivo
    res.json({ success: true, fileName: req.file.filename });
  } else {
    // Si hubo un error al subir el archivo, envía una respuesta con un mensaje de error
    res.status(500).json({ success: false, error: 'Error al subir el archivo.' });
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const httpServer = http.createServer(app);
const io = socketIO(httpServer);

const setupSocketIO = require('./socket-server');
setupSocketIO(io);

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  connectDB()
    .then(() => {
      httpServer.listen(config.PORT, () => {
        console.log(`Servidor escuchando en el puerto ${config.PORT}`);
      });
    })
    .catch((error) => {
      console.error("Error de conexión a MongoDB:", error);
    });
}

startServer();

module.exports = { io };
