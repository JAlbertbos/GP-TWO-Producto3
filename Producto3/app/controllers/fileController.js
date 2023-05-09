const Task = require('../models/Task');
const fs = require('fs');
const path = require('path');

const uploadFolder = path.join(__dirname, '..', 'uploads');

exports.uploadFile = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  const file = req.files.file;
  const uploadPath = path.join(uploadFolder, file.name);

  file.mv(uploadPath, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    // Renombrar el archivo para agregarle un ID único
    const extension = path.extname(uploadPath);
    const fileName = path.basename(uploadPath, extension);
    const newFileName = `${fileName}-${Date.now()}${extension}`;
    const newFilePath = path.join(uploadFolder, newFileName);

    fs.rename(uploadPath, newFilePath, async (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      try {
        const task = await Task.findById(req.body.taskId);
        if (!task) {
          return res.status(404).send('La tarea no existe.');
        }

        task.fileUrl = newFileName;
        await task.save();

        res.json({ success: true, message: 'Archivo subido correctamente.', fileName: newFileName });
      } catch (error) {
        console.error('Error al guardar el nombre del archivo en la base de datos:', error);
        return res.status(500).send('Error al guardar el nombre del archivo en la base de datos.');
      }
    });
  });
};