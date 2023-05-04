// Importando módulos necesarios
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
const WeeksController = require('./controllers/WeeksController');

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

// Config Socket.IO
const httpServer = http.createServer(app);
const io = socketIO(httpServer);

io.on('connection', (socket) => {
  console.log('Client connected');

  // Evento createWeek
  socket.on('createWeek', async (data, callback) => {
    console.log('Datos recibidos para crear semana:', data);

    try {
      // Crear una nueva semana utilizando el controlador
      const newWeek = await WeeksController.createWeek(data);

      // Enviar la nueva semana a todos los clientes conectados
      io.sockets.emit('newWeek', newWeek);

      // Llamar a la función de callback con éxito
      callback({ success: true, week: newWeek });
    } catch (error) {
      console.error('Error al crear semana:', error);
      callback({ success: false, error });
    }
  });

  // Evento updateWeek
  socket.on('updateWeek', async (data, callback) => {
    console.log('Datos recibidos para actualizar semana:', data);

    try {
      // Actualizar la semana utilizando el controlador
      const updatedWeek = await WeeksController.updateWeekById(data.id, data.updatedData);

      // Enviar la semana actualizada a todos los clientes conectados
      io.sockets.emit('updatedWeek', updatedWeek);

      // Llamar a la función de callback con éxito
      callback({ success: true, week: updatedWeek });
    } catch (error) {
      console.error('Error al actualizar semana:', error);
      callback({ success: false, error });
    }
  });

  // Evento getAllWeeks
  socket.on('getAllWeeks', async (_, callback) => {
    console.log('Solicitud de todas las semanas recibida');

    try {
      // Obtener todas las semanas utilizando el controlador
      const allWeeks = await WeeksController.getAllWeeks();

      // Llamar a la función de callback con éxito y la lista de semanas
      callback({ success: true, weeks: allWeeks });
    } catch (error) {
      console.error('Error al obtener todas las semanas:', error);
      callback({ success: false, error });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

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
