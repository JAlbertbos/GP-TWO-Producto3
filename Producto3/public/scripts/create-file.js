const socket = io();

// Obtener elementos del DOM
const modal = document.getElementById("uploadModal");
const openModal = document.getElementById("openModal");
const closeModal = document.querySelector(".close");

// Funciones para abrir y cerrar el modal
function openUploadModal() {
  modal.style.display = "block";
}

function closeUploadModal() {
  modal.style.display = "none";
}

// Event listeners para abrir y cerrar el modal
openModal.addEventListener("click", openUploadModal);
closeModal.addEventListener("click", closeUploadModal);

// Cerrar el modal al hacer clic fuera de él
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeUploadModal();
  }
});

// Enviar el formulario y manejar la subida del archivo
document.getElementById("uploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
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
      closeUploadModal();
      openUploadSuccessModal(); 
    } else {
      alert("Error al subir el archivo.");
    }
  } catch (error) {
    console.error("Error al subir el archivo:", error);
  }
});

function openUploadSuccessModal() {
  const successModal = document.getElementById("uploadSuccessModal");
  successModal.style.display = "block";
}

function closeUploadSuccessModal() {
  const successModal = document.getElementById("uploadSuccessModal");
  successModal.style.display = "none";
}

document.getElementById("closeSuccessModal").addEventListener("click", closeUploadSuccessModal);

