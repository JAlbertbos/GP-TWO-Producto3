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

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'public', 'Dashboard.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.log("No se ha recibido nada");
    return res.send({
      success: false
    });
  } else {
    console.log('Archivo recibido correctamente');
    io.emit('fileUploaded', { filename: req.file.filename });  // emitir el evento
    return res.send({
      success: true
    })
  }
});



startServer();

module.exports = { io };
