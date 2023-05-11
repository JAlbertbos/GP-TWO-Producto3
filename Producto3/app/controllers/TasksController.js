const Task = require('../models/Task');
const multer = require('multer');

// Configurar Multer para almacenar archivos en el sistema de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Asegúrate de que este directorio exista
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage });

// Añadir un nuevo endpoint para subir archivos
exports.uploadFile = upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const task = await Task.findById(req.params.taskId);
    
    // Aquí necesitarías subir tu archivo a donde quieras almacenarlo 
    // (p.ej., Amazon S3, Google Cloud Storage, etc.) y obtener la URL del archivo.
    // Esto es solo un ejemplo y no funcionará tal cual está.
    const fileUrl = await uploadFileToStorage(file);

    // Añadir la URL del archivo a la tarea y guardarla
    task.fileUrl = fileUrl;
    await task.save();

    res.status(200).send({ success: true, fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Error uploading file' });
  }
};


exports.getTasks = async ({ weekId }) => {
  try {
    const tasks = await Task.find({ week: weekId });
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};


exports.getTaskById = async (id) => {
  try {
    return await Task.findById(id).populate("week");
  } catch (err) {
    console.error(err);
    throw new Error("Error retrieving task");
  }
};

exports.createTask = async (taskData) => {
  try {
    taskData.week = taskData.weekId;
    delete taskData.weekId;
    const newTask = new Task(taskData);
    return await newTask.save();
  } catch (err) {
    console.error(err);
    throw new Error("Error creating task");
  }
};



exports.updateTaskById = async (id, updatedData) => {
  try {
    return await Task.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (err) {
    console.error(err);
    throw new Error("Error updating task");
  }
};

exports.deleteTask = async (id) => {

  try {
    await Task.findByIdAndRemove(id);
  } catch (err) {
    console.error(err);
    throw new Error("Error deleting task");
  }
};
