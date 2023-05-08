const fs = require('fs');
const path = require('path');

const uploadFolder = path.join(__dirname, '..', 'uploads');

exports.uploadFile = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  const file = req.files.file;
  const uploadPath = path.join(uploadFolder, file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    res.json({ success: true, message: 'Archivo subido correctamente.', fileName: file.name });
  });
};
