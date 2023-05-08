const fs = require('fs');
const path = require('path');

// Cambia esta ruta según la ubicación deseada para guardar los archivos
const uploadFolder = path.join(__dirname, '..', 'uploads');

exports.uploadFile = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  // El nombre del campo en el formulario debe coincidir con 'file' aquí
  const file = req.files.file;
  const uploadPath = path.join(uploadFolder, file.name);

  // Usa el método mv() para colocar el archivo en la carpeta de destino
  file.mv(uploadPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ success: true, message: 'Archivo subido correctamente.', fileName: file.name });
  });
};
