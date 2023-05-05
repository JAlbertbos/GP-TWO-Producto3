const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const config = require('./Producto2/config/config');

const tasksController = require('./Producto2/controllers/TasksController');
const weeksController = require('./Producto2/controllers/WeeksController');

const app = express();

// Conexión con MongoDB
mongoose.connect(config.databaseURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Middleware para servir archivos estáticos y parsear el cuerpo de las solicitudes
app.use(express.static(path.join(__dirname)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutas de la aplicación
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Producto2', 'Dashboard.html'));
});

app.get('/weektasks', (req, res) => {
  res.sendFile(path.join(__dirname, 'Producto2', 'Weektasks.html'));
});

// Ruta para GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);


// Iniciar el servidor
app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
