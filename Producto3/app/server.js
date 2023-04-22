// Importando módulos necesarios
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { typeDefs, resolvers } = require('./config/config.js');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

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

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  connectDB()
    .then(() => {
      app.listen(config.PORT, () => {
        console.log(`Servidor escuchando en el puerto ${config.PORT}`);
      });
    })
    .catch((error) => {
      console.error("Error de conexión a MongoDB:", error);
    });
}

startServer();
