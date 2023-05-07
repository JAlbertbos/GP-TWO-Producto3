const weeksController = require('./controllers/WeeksController');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('Cliente -> Conectado');

    socket.on('createWeek', async (data, callback) => {
      console.log('Datos recibidos para crear semana:', data);

      try {
        const newWeek = await WeeksController.createWeek(data);
        io.sockets.emit('newWeek', newWeek);
        callback({ success: true, week: newWeek, message: 'OK desde socket!' });
      } catch (error) {
        console.error('Error al crear semana:', error);
        callback({ success: false, error, message: 'Error al crear semana' });
      }
    });

    socket.on('updateWeek', async (data, callback) => {
      console.log('Datos recibidos para actualizar semana:', data);

      try {
        const updatedWeek = await WeeksController.updateWeekById(data.id, data.updatedData);
        io.sockets.emit('updatedWeek', updatedWeek);
        callback({ success: true, week: updatedWeek, message: 'OK' });
      } catch (error) {
        console.error('Error al actualizar semana:', error);
        callback({ success: false, error, message: 'OK' });
      }
    });

    socket.on('getAllWeeks', (data, callback) => {
      weeksController.getWeeks()
        .then((semanas_obtenidas) => {
          callback({ message: 'OK', weeks: semanas_obtenidas });
        })
        .catch((error) => {
          console.error('Error al obtener semanas:', error);
          callback({ error: 'Error al obtener semanas', weeks: [] });
        });
    });

    

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

module.exports = setupSocketIO;
