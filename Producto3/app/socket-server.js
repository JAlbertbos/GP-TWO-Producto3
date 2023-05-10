const WeeksController = require('./controllers/WeeksController');
const TasksController = require('./controllers/TasksController');
const FileController = require('./controllers/fileController');


function setupSocketIO(io) {
  io.on('connection', (socket) => {
    //console.log('Client connected');

    //SEMANAS
    socket.on('createWeek', async (data, callback) => {
      console.log('Datos recibidos para crear semana:', data);

      try {
        const newWeek = await WeeksController.createWeek(data);
        io.sockets.emit('newWeek', newWeek);
        console.log('OK: Semana creada');
        callback({ success: true, week: newWeek });
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
        console.log('OK: Semana actualizada');
        callback({ success: true, updatedWeek: updatedWeek });
      } catch (error) {
        console.error('Error al actualizar semana:', error);
        callback({ success: false, error });
      }
    });
    socket.on('getAllWeeks', (data, callback) => {
      WeeksController.getAllWeeks()
        .then((semanas_obtenidas) => {
          console.log('OK: Semanas obtenidas');
          callback({ success: true, weeks: semanas_obtenidas });
        })
        .catch((error) => {
          console.error('Error al obtener semanas:', error);
          callback({ success: false, error: error.message });
        })
    });
    // TAREAS
    socket.on('getAllTasks', async (data, callback) => {
      try {
        const tasks = await TasksController.getTasks({ weekId: data.weekId });
        console.log('OK: Tareas obtenidas');
        callback({ success: true, tasks });
      } catch (error) {
        console.error('Error al obtener tareas:', error);
        callback({ success: false, error });
      }
    });
    socket.on('createTask', async (data, callback) => {
      console.log('Datos recibidos para crear tarea:', data); // Añade esta línea para depurar
    
      try {
        const newTask = await TasksController.createTask(data);
        io.sockets.emit('newTask', newTask);
        console.log('OK: Tarea creada');
        callback({ success: true, task: newTask });
      } catch (error) {
        console.error('Error al crear tarea:', error);
        callback({ success: false, error });
      }
    });
    
    socket.on('updateTask', async (data, callback) => {
      try {
        const updatedTask = await TasksController.updateTaskById(data.id, data.updatedData);
        io.sockets.emit('updatedTask', updatedTask);
        console.log('OK: Tarea actualizada');
        callback({ success: true, task: updatedTask });
      } catch (error) {
        console.error('Error al actualizar tarea:', error);
        callback({ success: false, error });
      }
    });
    socket.on('deleteTask', async (data, callback) => {
      try {
        await TasksController.deleteTask(data.id);
        io.sockets.emit('deletedTask', { id: data.id });
        console.log('OK: Tarea eliminada');
        callback({ success: true });
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
        callback({ success: false, error });
      }
    });

    socket.on('file_uploaded', async (fileName, taskId, callback) => {
      const data = {
        files: {
          file: fileName 
        },
        body: {
          taskId
        }
      };
    
      try {
        const fileData = await FileController.uploadFile(data);
        console.log('OK: Fichero Adjuntado correctamente');
        if (typeof callback === 'function') {
          callback({ success: true, fileData });
        }
      } catch (error) {
        console.error('Error al adjuntar el fichero:', error);
        if (typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });
    
    


    socket.on('disconnect', () => {
      //console.log('Client disconnected');
    });
  });
}

module.exports = setupSocketIO;