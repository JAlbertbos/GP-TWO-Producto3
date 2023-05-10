exports.uploadFile = async (data) => {
  if (!data.files || Object.keys(data.files).length === 0) {
    throw new Error('No se subió ningún archivo.');
  }

  if (!data.files.file) {
    throw new Error('No se encontró el archivo "file".');
  }

  const file = data.files.file;
  const uploadPath = path.join(uploadFolder, file.name);

  // Aquí asumimos que file.mv devuelve una promesa. Si no es así, tendrás que manejar esto de manera diferente.
  await file.mv(uploadPath);

  // Renombrar el archivo para agregarle un ID único
  const extension = path.extname(uploadPath);
  const fileName = path.basename(uploadPath, extension);
  const newFileName = `${fileName}-${Date.now()}${extension}`;
  const newFilePath = path.join(uploadFolder, newFileName);

  await fs.promises.rename(uploadPath, newFilePath);

  // Aquí asumimos que tienes una función Task.findById que devuelve una promesa. 
  // Si no es así, tendrás que manejar esto de manera diferente.
  const task = await Task.findById(data.body.taskId);
  if (!task) {
    throw new Error('La tarea no existe.');
  }

  task.fileUrl = newFileName;
  await task.save();

  return { success: true, message: 'Archivo subido correctamente.', fileName: newFileName };
};
