document.addEventListener('DOMContentLoaded', () => {
  const deleteCardBtn = document.querySelector("#deleteButton");
  
  if (deleteCardBtn) {
    deleteCardBtn.addEventListener("click", () => {
      if (selectedCard) {
        selectedCard.remove();
        selectedCard = null;
        const eliminarTareaModalEl = document.getElementById("eliminarTareaModal");
        const eliminarTareaModal = bootstrap.Modal.getInstance(eliminarTareaModalEl);
        eliminarTareaModal.hide();
      }
    });
  } else {
    console.error('No se encontró el elemento con ID "#deleteButton".');
  }
  
  document.addEventListener("click", function (event) {
    if (event.target.matches(".eliminar-tarea")) {
      const card = event.target.closest(".card");
      selectedCard = card;
     
      const eliminarTareaModalEl = document.getElementById("eliminarTareaModal");
      const eliminarTareaModal = new bootstrap.Modal(eliminarTareaModalEl);
      eliminarTareaModal.show();
    }
  });
});