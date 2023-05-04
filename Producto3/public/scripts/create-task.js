
let selectedCard;


async function createOrUpdateTask(id, name, description, startTime, endTime, participants, location, completed, day, weekId) {
  const isUpdating = Boolean(id);
  const query = isUpdating ? 'updateTask' : 'createTask';
  const taskIdArg = isUpdating ? `id: "${id}",` : '';
  const weekIdArg = !isUpdating ? `weekId: "${weekId}",` : '';
  const taskArgName = isUpdating ? 'task' : 'taskData';

  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        mutation {
          ${query}(${taskIdArg} ${taskArgName}: {
            name: "${name}"
            description: "${description}"
            startTime: "${startTime}"
            endTime: "${endTime}"
            participants: "${participants}"
            location: "${location}"
            completed: ${completed}
            day: "${day}"
          }${weekIdArg}) {
            _id
          }
        }
      `,
    }),
  });

  const jsonResponse = await response.json();

  if (jsonResponse.errors) {
    console.error("Server response:", jsonResponse);
    throw new Error(`Error in GraphQL query: ${jsonResponse.errors[0].message}`);
  }

  return jsonResponse.data[query]._id;
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
  let dropzone;
  if (day === 'zone-bottom') {
    dropzone = document.querySelector('.zone-bottom');
  } else {
    dropzone = document.querySelector(`.contenedor-dia[data-day="${day}"] .dropzone`);
  }

  if (dropzone) {
    dropzone.appendChild(taskCard);
  } else {
    console.error("Dropzone no encontrada");
  }
}


async function loadTasksFromDatabase() {
  const tasks = await getTasks(weekId);
  for (const task of tasks) {
    const taskCard = createTaskCard(task);
    taskCard.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', this.id);
    });
    addTaskToDOM(taskCard, task.day === 'zone-bottom' ? 'zone-bottom' : task.day);
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

    tarjeta.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', this.id);
    });
  });
  const checkbox = tarjeta.querySelector('.form-check-input');
  if (task.completed) {
    checkbox.checked = true;
    tarjeta.style.borderColor = 'green';
    tarjeta.style.borderWidth = '2px';
  }

  // Añadir un nuevo listener para el evento 'change' de la casilla de verificación
  checkbox.addEventListener('change', async function () {
    if (this.checked) {
      tarjeta.style.borderColor = 'green';
      tarjeta.style.borderWidth = '2px';
    } else {
      tarjeta.style.borderColor = '';
      tarjeta.style.borderWidth = '';
    }

    // Llamar a createOrUpdateTask para actualizar el campo 'completed' en la base de datos
    try {
      const taskId = task._id;
      const completed = this.checked;
      await createOrUpdateTask(taskId, task.name, task.description, task.startTime, task.endTime, task.participants, task.location, completed, task.day, null);
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
    }
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

  const contenedorDia = dropzoneAncestor.closest('.contenedor-dia');
  const zoneBottom = dropzoneAncestor.closest('.zone-bottom');

  let newDay;

  if (contenedorDia) {
    newDay = contenedorDia.getAttribute('data-day');
  } else if (zoneBottom) {
    newDay = 'zone-bottom';
  } else {
    console.error("No se encontró el elemento .contenedor-dia o .zone-bottom");
    return;
  }

  const taskData = {
    id: element.getAttribute('data-id'),
    name: element.querySelector('.card-title').innerText,
    description: element.querySelector('.card-text').innerText,
    startTime: element.querySelector('.list-group-item:nth-child(1)').innerText.replace('Hora de inicio: ', ''),
    endTime: element.querySelector('.list-group-item:nth-child(2)').innerText.replace('Hora de final: ', ''),
    participants: element.querySelector('.list-group-item:nth-child(3)').innerText.replace('Participantes: ', ''),
    location: element.querySelector('.list-group-item:nth-child(4)').innerText.replace('Ubicación: ', ''),
    completed: element.querySelector('.form-check-input').checked,
  };

  await createOrUpdateTask(taskData.id, taskData.name, taskData.description, taskData.startTime, taskData.endTime, taskData.participants, taskData.location, taskData.completed, newDay, weekId);

  dropzoneAncestor.appendChild(element);
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

    const task = {
      _id: newTaskId,
      name: nombreTarea.value,
      description: descripcion.value,
      startTime: horaInicio.value,
      endTime: horaFinal.value,
      participants: participantes.value,
      location: ubicacion.value,
      completed: completed.checked,
      day: selectedDay,
    };

    const taskCard = createTaskCard(task);
    taskCard.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', this.id);
    });
    addTaskToDOM(taskCard, selectedDay);

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