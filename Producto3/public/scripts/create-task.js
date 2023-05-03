

let selectedCard;

async function createOrUpdateTask(id, name, description, startTime, endTime, participants, location, completed, day, weekId) {
  const query = id ? 'updateTask' : 'createTask';
const taskId = id ? `, id: "${id}"` : '';
const response = await fetch('/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({
    query: `
      mutation {
        ${query}(taskData: {
          name: "${name}"
          description: "${description}"
          startTime: "${startTime}"
          endTime: "${endTime}"
          participants: "${participants}"
          location: "${location}"
          completed: ${completed}
          day: "${day}"
        }, weekId: "${weekId}"${taskId}) {
          _id
        }
      }
    `,
  }),
});

  const result = await response.json();
  console.log('Server response:', result);
  return result.data[query].id;
}

async function getTasks(weekId) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          getAllTasks(weekId: "${weekId}") {
            _id
            name
            description
            startTime
            endTime
            participants
            location
            completed
            day
          }
        }
      `,
    }),
  });

  const result = await response.json();
  console.log('Server response:', result);
  return result.data.getAllTasks;
}

function addTaskToDOM(taskCard, day) {
  const dropzone = document.querySelector(`.contenedor-dia[data-day="${day}"] .dropzone`);
  if (dropzone) {
    dropzone.appendChild(taskCard);
  }
}

async function loadTasksFromDatabase() {
  const tasks = await getTasks(weekId);
  for (const task of tasks) {
    const taskCard = createTaskCard(task);
    addTaskToDOM(taskCard, task.day);
  }
}

function createTaskCard(task) {
  const tarjeta = document.createElement('div');
  tarjeta.id = `tarjeta-${task._id}`;
  tarjeta.classList.add('card', 'my-3', 'draggable');
  tarjeta.setAttribute('data-id', task._id);
  tarjeta.innerHTML = `
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="card-title">${task.name}</h5>
        <button type="button"  class="btn btn-link p-0 eliminar-tarea">${iconoPapelera.outerHTML}</button>
      </div>
      <p class="card-text">${task.description}</p>
      <ul class="list-group list-group-flush">
        <li class="list-group-item"><strong>Hora de inicio:</strong> ${task.startTime}</li>
        <li class="list-group-item"><strong>Hora de final:</strong> ${task.endTime}</li>
        <li class="list-group-item"><strong>Participantes:</strong> ${task.participants}</li>
        <li class="list-group-item"><strong>Ubicación:</strong> ${task.location}</li>
      </ul>
      <div class="form-check mt-3">
        <input class="form-check-input" type="checkbox" id="tarea-${task.name}">
        <label class="form-check-label" for="tarea-${task.name}">Tarea terminada</label>
      </div>
      <div class="mt-auto d-flex justify-content-end">
      <button type="button" class="btn btn-link p-0 editar-tarea"><i class="bi bi-pencil-square text-primary"></i></button>
      </div>
      </div>
    </div>
  `;
  tarjeta.setAttribute('draggable', true);
  const botonEliminar = tarjeta.querySelector('.eliminar-tarea');
  botonEliminar.addEventListener('click', async function () {
  selectedCard = tarjeta;
  const taskId = selectedCard.getAttribute('data-id');
  
  const eliminarTareaModalEl = document.getElementById("eliminarTareaModal");
  const eliminarTareaModal = new bootstrap.Modal(eliminarTareaModalEl);
  eliminarTareaModal.show();
});

  return tarjeta;

  
}

async function deleteTask(taskId) {
  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation {
          deleteTask(id: "${taskId}") {
            _id
          }
        }
      `,
    }),
  });

  const result = await response.json();
  console.log('Server response:', result);
  return result.data.deleteTask;
}


function allowDrop(event) {
  event.preventDefault();
}
window.allowDrop = allowDrop;
async function drop(event) {
  let dropzoneAncestor = event.target.closest('.dropzone');

  if (!dropzoneAncestor) {
    return;
  }

  event.preventDefault();
  const taskId = event.dataTransfer.getData("text");
  const element = document.getElementById(taskId);

  const newDay = dropzoneAncestor.closest('.contenedor-dia').getAttribute('data-day');
  const taskElement = document.getElementById(taskId);
  const weekId = dropzoneAncestor.closest('.contenedor-semana').getAttribute('data-weekid');

  const name = taskElement.querySelector('.card-title').innerText;
  const description = taskElement.querySelector('.card-text').innerText;
  const startTime = taskElement.querySelector('.list-group-item:nth-child(1)').innerText.replace('Hora de inicio: ', '');
  const endTime = taskElement.querySelector('.list-group-item:nth-child(2)').innerText.replace('Hora de final: ', '');
  const participants = taskElement.querySelector('.list-group-item:nth-child(3)').innerText.replace('Participantes: ', '');
  const location = taskElement.querySelector('.list-group-item:nth-child(4)').innerText.replace('Ubicación: ', '');
  const completed = taskElement.querySelector('.form-check-input').checked;
 
  await createOrUpdateTask(taskId.replace('tarjeta-', ''), name, description, startTime, endTime, participants, location, completed, newDay, weekId);

  if (element && element.nodeType === Node.ELEMENT_NODE) {
    dropzoneAncestor.appendChild(element);
  } else {
    console.error(`No se pudo encontrar el elemento con el id ${taskId} o no es un nodo válido.`);
  }
}
window.drop = drop;
let tarjetaAEditar;
let selectedDay;
document.querySelectorAll('[data-day]').forEach(button => {
  button.addEventListener('click', function () {
    selectedDay = this.getAttribute('data-day');
  });
});

const form = document.querySelector('#formtask form');
const nombreTarea = document.querySelector('#nombreTarea');
const descripcion = document.querySelector('#descripcion');
const horaInicio = document.querySelector('#horaInicio');
const horaFinal = document.querySelector('#horaFinal');
const participantes = document.querySelector('#participantes');
const ubicacion = document.querySelector('#ubicacion');
const completed = document.querySelector('#tareaTerminada');
const iconoPapelera = document.createElement('i');
iconoPapelera.classList.add('bi', 'bi-trash-fill', 'ms-2', 'eliminar-tarea', 'text-danger');
const urlParams = new URLSearchParams(window.location.search);
const weekId = urlParams.get('weekId');


function validarCampos() {
  let mensajeError = '';

  if (nombreTarea.value.trim() === '') {
    mensajeError = 'El nombre de la tarea no puede estar vacío.';
  } else if (descripcion.value.trim() === '') {
    mensajeError = 'La descripción no puede estar vacía.';
  } else if (horaInicio.value === '') {
    mensajeError = 'La hora de inicio no puede estar vacía.';
  } else if (horaFinal.value === '') {
    mensajeError = 'La hora de final no puede estar vacía.';
  } else if (participantes.value.trim() === '') {
    mensajeError = 'Los participantes no pueden estar vacíos.';
  } else if (ubicacion.value.trim() === '') {
    mensajeError = 'La ubicación no puede estar vacía.';
  }

  if (mensajeError) {
    document.getElementById('genericModalMessage').innerText = mensajeError;
    const modal = new bootstrap.Modal(document.getElementById('genericModal'));
    modal.show();
    return false;
  }

  return true;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();


  if (!validarCampos()) {
    return;
  }
  if (tarjetaAEditar) {
    tarjetaAEditar.querySelector('.card-title').innerText = nombreTarea.value;
    tarjetaAEditar.querySelector('.card-text').innerText = descripcion.value;
    tarjetaAEditar.querySelector('.list-group-item:nth-child(1)').innerText = `Hora de inicio: ${horaInicio.value}`;
    tarjetaAEditar.querySelector('.list-group-item:nth-child(2)').innerText = `Hora de final: ${horaFinal.value}`;
    tarjetaAEditar.querySelector('.list-group-item:nth-child(3)').innerText = `Participantes: ${participantes.value}`;
    tarjetaAEditar.querySelector('.list-group-item:nth-child(4)').innerText = `Ubicación: ${ubicacion.value}`;

    tarjetaAEditar = null;


    const modal = bootstrap.Modal.getInstance(document.querySelector('#formtask'));
    await createOrUpdateTask(tarjetaAEditar.getAttribute('data-id'), nombreTarea.value, descripcion.value, horaInicio.value, horaFinal.value, participantes.value, ubicacion.value, completed.checked, newDay, weekId);

    modal.hide();
    form.reset();
  } else {
    const newTaskId = await createOrUpdateTask(null, nombreTarea.value, descripcion.value, horaInicio.value, horaFinal.value, participantes.value, ubicacion.value, completed.checked, selectedDay, weekId);

    const tarjeta = document.createElement('div');
    const idTarjeta = Date.now().toString();
    tarjeta.id = `tarjeta-${idTarjeta}`;
    tarjeta.classList.add('card', 'my-3', 'draggable');
    tarjeta.setAttribute('data-id', newTaskId);
    tarjeta.id = `tarjeta-${newTaskId}`;
    tarjeta.innerHTML = `
    <div class="card-body">
      <div class="d-flex align-items-center justify-content-between">
        <h5 class="card-title">${nombreTarea.value}</h5>
        <button type="button"  class="btn btn-link p-0 eliminar-tarea">${iconoPapelera.outerHTML}</button>
      </div>
      <p class="card-text">${descripcion.value}</p>
      <ul class="list-group list-group-flush">
        <li class="list-group-item"><strong>Hora de inicio:</strong> ${horaInicio.value}</li>
        <li class="list-group-item"><strong>Hora de final:</strong> ${horaFinal.value}</li>
        <li class="list-group-item"><strong>Participantes:</strong> ${participantes.value}</li>
        <li class="list-group-item"><strong>Ubicación:</strong> ${ubicacion.value}</li>
      </ul>
      <div class="form-check mt-3">
        <input class="form-check-input" type="checkbox" id="tarea-${nombreTarea.value}">
        <label class="form-check-label" for="tarea-${nombreTarea.value}">Tarea terminada</label>
      </div>
      <div class="mt-auto d-flex justify-content-end">
      <button type="button" class="btn btn-link p-0 editar-tarea"><i class="bi bi-pencil-square text-primary"></i></button>
      </div>
      </div>
      
    </div>
  `;
    tarjeta.setAttribute('draggable', true);
    tarjeta.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', this.id);
    });

    let dropzone;
    if (selectedDay) {
      dropzone = document.querySelector(`.contenedor-dia[data-day="${selectedDay}"] .dropzone`);
    }
    if (!dropzone) {
      dropzone = document.querySelector('.zone-bottom');
    }

    dropzone.appendChild(tarjeta);
    selectedDay = undefined;
    const checkbox = tarjeta.querySelector('.form-check-input');
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        tarjeta.classList.add('borde-verde');
      } else {
        tarjeta.classList.remove('borde-verde');
      }
    });
    

    const modal = bootstrap.Modal.getInstance(document.querySelector('#formtask'));
    modal.hide();
    form.reset();
    const botonEliminar = tarjeta.querySelector('.eliminar-tarea');
    botonEliminar.addEventListener('click', async function () {
      selectedCard = tarjeta;
      const taskId = selectedCard.getAttribute('data-id');
      await deleteTask(taskId);
      const eliminarTareaModalEl = document.getElementById("eliminarTareaModal");
      const eliminarTareaModal = new bootstrap.Modal(eliminarTareaModalEl);
      eliminarTareaModal.show();
    });
    

    // Lapiz edicion
    const botonEditar = tarjeta.querySelector('.editar-tarea');
    botonEditar.addEventListener('click', function () {

      tarjetaAEditar = tarjeta;


      const titulo = tarjeta.querySelector('.card-title').innerText;
      const desc = tarjeta.querySelector('.card-text').innerText;
      const horaInicioTexto = tarjeta.querySelector('.list-group-item:nth-child(1)').innerText.replace('Hora de inicio: ', '');
      const horaFinalTexto = tarjeta.querySelector('.list-group-item:nth-child(2)').innerText.replace('Hora de final: ', '');
      const participantesTexto = tarjeta.querySelector('.list-group-item:nth-child(3)').innerText.replace('Participantes: ', '');
      const ubicacionTexto = tarjeta.querySelector('.list-group-item:nth-child(4)').innerText.replace('Ubicación: ', '');
      const completed = tarjeta.querySelector('.form-check-input').checked;


      nombreTarea.value = titulo;
      descripcion.value = desc;
      horaInicio.value = horaInicioTexto;
      horaFinal.value = horaFinalTexto;
      participantes.value = participantesTexto;
      ubicacion.value = ubicacionTexto;



      const modal = new bootstrap.Modal(document.getElementById("formtask"));
      modal.show();

    });

    tarjeta.setAttribute('data-id', idTarjeta);
  }

  form.reset(); // Reiniciar formulario para edición sin bugs!
});
document.getElementById('deleteButton').addEventListener('click', async function () {
  const taskId = selectedCard.getAttribute('data-id');
  await deleteTask(taskId); // Elimina la tarea aquí.
  const tarjeta = document.getElementById(`tarjeta-${taskId}`);
  if (tarjeta) {
    tarjeta.remove();
  }
  const eliminarTareaModalEl = document.getElementById("eliminarTareaModal");
  const eliminarTareaModal = bootstrap.Modal.getInstance(eliminarTareaModalEl);
  eliminarTareaModal.hide();
});

loadTasksFromDatabase();