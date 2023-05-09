document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  let uploadedFileName = null;

  

  const uploadModalElement = document.getElementById("uploadModal");
  const openModal = document.getElementById("openModal");
  const closeModal = document.querySelector(".btn-close");

  const uploadModal = new bootstrap.Modal(uploadModalElement);

  openModal.addEventListener("click", () => uploadModal.show());
  closeModal.addEventListener("click", () => uploadModal.hide());

  document.getElementById("uploadButton").addEventListener("click", async () => {
    
    const fileInput = document.getElementById("fileInput");
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        socket.emit("file_uploaded", data.fileName);
        uploadedFileName = data.fileName;
        document.getElementById('fileUploadStatus').innerText = `Archivo a subir: ${uploadedFileName}`;
        document.getElementById('fileUploadStatus').style.display = 'inline'; // Muestra el texto
        uploadModal.hide();
        openUploadSuccessModal();
      } else {
        alert("Error al subir el archivo.");
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error);
    }
  });

  function openUploadSuccessModal() {
    
    const successModalElement = document.getElementById("uploadSuccessModal");
    const successModal = new bootstrap.Modal(successModalElement);
    successModal.show();
  }

  function closeUploadSuccessModal() {
    
    const successModalElement = document.getElementById("uploadSuccessModal");
    const successModal = new bootstrap.Modal(successModalElement);
    successModal.hide();
  }

  document.getElementById("closeSuccessModal").addEventListener("click", closeUploadSuccessModal);
});
