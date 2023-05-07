const WeeksController = require('./controllers/WeeksController');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('createWeek', async (data, callback) => {
      console.log('Datos recibidos para crear semana:', data);

      try {
        const newWeek = await WeeksController.createWeek(data);
        io.sockets.emit('newWeek', newWeek);
        callback({ success: response.success ,message: 'OK', week: newWeek });
        } catch (error) {
        console.error('Error al crear semana:', error);
        callback({ success: false, error });
      }
    });

    socket.on('updateWeek', async (data, callback) => {
      console.log('Datos recibidos para actualizar semana:', data);
    
      try {
        const updatedWeek = await WeeksController.updateWeekById(data.id, data.updatedData);
        io.sockets.emit('updatedWeek', updatedWeek);
        callback({ success: true,message: 'OK', updatedWeek: updatedWeek });
      } catch (error) {
        console.error('Error al actualizar semana:', error);
        callback({ success: false, error });
      }
    });
    

    socket.on('getAllWeeks', (data, callback) => {
      WeeksController.getAllWeeks()
        .then((semanas_obtenidas) => {
          callback({ success: true, message: 'OK', weeks: semanas_obtenidas });
        })
        .catch((error) => {
          console.error('Error al obtener semanas:', error);
          callback({ success: false, error: error.message });
        })
      });
      


    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}

module.exports = setupSocketIO;
