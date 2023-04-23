const { graphql } = require('graphql');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const path = require('path');

const { typeDefs, resolvers } = require('./config/graphql');
const { mongoURI, PORT } = require('./config/config');

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('MongoDB conectado...');

    const app = express();

    app.use(express.static(path.join(__dirname, '..', 'public')));

    // Sirve el archivo HTML estático en la ruta raíz
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '..', 'public', 'Dashboard.html'));
    });

    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });

    await server.start();
    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () =>
      console.log(`Servidor escuchando en el puerto ${PORT}${server.graphqlPath}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });
