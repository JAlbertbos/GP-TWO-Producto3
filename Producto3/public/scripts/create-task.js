const socket = io();
let selectedCard;

// Función para crear o actualizar una tarea usando Socket.IO
async function createOrUpdateTask(
	id,
	name,
	description,
	startTime,
	endTime,
	participants,
	taskLocation,
	completed,
	day,
	weekId,
	taskCard,
	validateTask = true,
	arrayBuffer = null,
	filename = null
) {
	return new Promise((resolve, reject) => {

		// Validar campos
		if (validateTask) {
			if (!validarCampos()) {
				return;
			}
		}

		const taskData = {
			id,
			name,
			description,
			startTime,
			endTime,
			participants,
			location: taskLocation,
			completed,
			day,
			weekId,
			file: arrayBuffer,
			filename,
		};
		

		const onSuccess = (isCreated) => {
			if (isCreated) {
				console.log('Recargando página...');
				window.location.reload();
			}
		};

		if (!id) {
			socket.emit('createTask', { ...taskData, day }, async (response) => {
				if (response.success) {
					console.log('Tarea creada con éxito');
					const newTaskId = response.task.id; // Accede a la propiedad 'task' de la respuesta

					// Actualizar el atributo 'data-id' y el ID de la tarjeta
					if (taskCard) {
						taskCard.setAttribute('data-id', newTaskId);
						taskCard.id = `tarjeta-${newTaskId}`;
					}
					resolve(newTaskId);
				} else {
					validarCampos(`Error al crear tarea: ${response.error}`);
					reject(new Error(`Error al crear tarea: ${response.error}`));
				}
			});
		} else {
			socket.emit('updateTask', { id, updatedData: taskData }, (response) => {
				if (response.success) {
					console.log('Tarea actualizada con éxito');
					resolve(id);
					onSuccess(false);
				} else {
					validarCampos(`Error al actualizar tarea: ${response.error}`);
					reject(new Error(`Error al actualizar tarea: ${response.error}`));
				}
			});
		}
	});
}

// Función para crear una tarjeta de tarea en el DOM a partir de los datos de la tarea
function createTaskCard(task) {
	const tarjeta = document.createElement('div');
	tarjeta.id = `tarjeta-${task._id}`;
	tarjeta.classList.add('card', 'my-3', 'draggable');
	tarjeta.setAttribute('data-id', task._id);
	let linkedFileIndicator = '';
    if (task.fileUrl) {
		linkedFileIndicator = `<li class="list-group-item"><strong>Archivo vinculado:</strong> <a href="${task.fileUrl}" target="_blank">Ver archivo</a></li>`;
	}

	tarjeta.innerHTML = `
	  <div class="card-body">
		<div class="d-flex align-items-center justify-content-between">
		  <h5 class="card-title">${task.name}</h5>
		  <button type="button" class="btn btn-link p-0 eliminar-tarea">${iconoPapelera.outerHTML}</button>
		</div>
		<p class="card-text">${task.description}</p>
		<ul class="list-group list-group-flush">
		  <li class="list-group-item"><strong>Hora de inicio:</strong> ${task.startTime}</li>
		  <li class="list-group-item"><strong>Hora de final:</strong> ${task.endTime}</li>
		  <li class="list-group-item"><strong>Participantes:</strong> ${task.participants}</li>
		  <li class="list-group-item"><strong>Ubicación:</strong> ${task.location}</li>
		  ${linkedFileIndicator}
		</ul>
		<div class="form-check mt-3">
		  <input class="form-check-input" type="checkbox" id="tarea-${task.name}">
		  <label class="form-check-label" for="tarea-${task.name}">Tarea terminada</label>
		</div>
		<div class="mt-auto d-flex justify-content-between">
		  <button type="button" class="btn btn-link p-0 upload-tarea"><i class="bi bi-upload"></i></button>
		  <button type="button" class="btn btn-link p-0 editar-tarea"><i class="bi bi-pencil-square text-primary"></i></button>
		</div>
	  </div>
	`;

	tarjeta.setAttribute('draggable', true);

	const botonEliminar = tarjeta.querySelector('.eliminar-tarea');
	botonEliminar.addEventListener('click', async function () {
		selectedCard = tarjeta;
		const taskId = selectedCard.getAttribute('data-id');

		const eliminarTareaModalEl = document.getElementById('eliminarTareaModal');
		const eliminarTareaModal = new bootstrap.Modal(eliminarTareaModalEl);
		eliminarTareaModal.show();
	});

	const checkbox = tarjeta.querySelector('.form-check-input');
	if (task.completed) {
		checkbox.checked = true;
		tarjeta.style.borderColor = 'green';
		tarjeta.style.borderWidth = '2px';
	}

	checkbox.addEventListener('change', async function () {
		if (this.checked) {
			tarjeta.style.borderColor = 'green';
			tarjeta.style.borderWidth = '2px';
		} else {
			tarjeta.style.borderColor = '';
			tarjeta.style.borderWidth = '';
		}

		try {
			const taskId = task._id;
			const completed = this.checked;
			await createOrUpdateTask(
				taskId,
				task.name,
				task.description,
				task.startTime,
				task.endTime,
				task.participants,
				task.location,
				task.completed,
				task.day,
				null,
				tarjeta,
				false, // Pasar false para validateTask
				arrayBuffer, // Agregar el arrayBuffer al objeto de datos de la tarea
				filename // Agregar el nombre del archivo al objeto de datos de la tarea
			);
		} catch (error) {
			console.error('Error al actualizar la tarea:', error);
		}
	});


	const botonUpload =	tarjeta.querySelector('.upload-tarea');
	botonUpload.addEventListener('click', function () {
		// Mostrar el modal de subida de archivos
		const uploadModalEl = document.getElementById('uploadModal');
		const uploadModal = new bootstrap.Modal(uploadModalEl);
		uploadModal.show();
	
		uploadModalEl.querySelector('#uploadButton').addEventListener('click', async function (e) {
			e.preventDefault();
	
			// Recuperar el archivo seleccionado
			const fileInput = document.getElementById('fileInput');
			const file = fileInput.files[0];
	
			if (!file) {
				console.error('No se seleccionó ningún archivo.');
				return;
			}
	
			// Leer el archivo como un ArrayBuffer
			const reader = new FileReader();
			reader.onload = async function (event) {
				const arrayBuffer = event.target.result;
				const filename = file.name;
	
				// Actualizar la tarea con la información del archivo
				try {
					const taskId = task._id;
					await createOrUpdateTask(
						taskId,
						task.name,
						task.description,
						task.startTime,
						task.endTime,
						task.participants,
						task.location,
						task.completed,
						task.day,
						null,
						tarjeta,
						false, // Pasar false para validateTask
						arrayBuffer, // Agregar el arrayBuffer al objeto de datos de la tarea
						filename // Agregar el nombre del archivo al objeto de datos de la tarea
					);
	
					// Emitir el evento de socket después de la actualización de la tarea
					socket.emit('fileUploaded', { file: arrayBuffer, filename }, (response) => {
						if (response.success) {
							console.log('Archivo subido con éxito:', response.file);
						} else {
							console.error('Error al subir archivo:', response.error);
						}
					});
				} catch (error) {
					console.error('Error al actualizar la tarea:', error);
				}
	
				// Ocultar el modal y borrar la selección del input de archivo
				uploadModal.hide();
				fileInput.value = '';
			};
			reader.readAsArrayBuffer(file);
		});
	});
	

	return tarjeta;
}

// Función para obtener las tareas de la base de datos por ID de semana usando Socket.IO
async function getTasks(weekId) {
	return new Promise((resolve, reject) => {
		socket.emit('getAllTasks', { weekId }, (response) => {
			if (response.success) {
				console.log('Carga del servidor:', response);
				resolve(response.tasks);
			} else {
				console.error('Carga del servidor:', response);
				reject(new Error(`Error en getAllTasks: ${response.error}`));
			}
		});
	});
}
// Función para agregar una tarjeta de tarea al DOM en el día correspondiente
function addTaskToDOM(taskCard, selectedDay) {
	let dropzone;
	if (selectedDay) {
		dropzone = document.querySelector(
			`.contenedor-dia[data-day="${selectedDay}"] .dropzone`
		);
	}
	if (!dropzone) {
		dropzone = document.querySelector('.zone-bottom');
	}
	if (dropzone) {
		dropzone.appendChild(taskCard);
	} else {
		console.error('Dropzone no encontrada');
	}
}

// Función para cargar las tareas de la base de datos y agregarlas al DOM
async function loadTasksFromDatabase() {
	const tasks = await getTasks(weekId);
	for (const task of tasks) {
		const taskCard = createTaskCard(task);
		taskCard.addEventListener('dragstart', function (event) {
			event.dataTransfer.setData('text/plain', this.id);
		});
		addTaskToDOM(
			taskCard,
			task.day === 'zone-bottom' ? 'zone-bottom' : task.day
		);
	}
}

// Función para eliminar una tarea de la base de datos por ID usando Socket.IO
async function deleteTask(taskId) {
	return new Promise((resolve, reject) => {
		socket.emit('deleteTask', { id: taskId }, (response) => {
			if (response.success) {
				console.log('Tarea Eliminada:', response);
				resolve(response);
			} else {
				console.error('Respuesta del servidor:', response);
				reject(new Error(`Error en deleteTask: ${response.error}`));
			}
		});
	});
}
// Función para permitir soltar elementos en una zona de soltado (dropzone)
function allowDrop(event) {
	event.preventDefault();
}
window.allowDrop = allowDrop;
// Función para manejar el evento de soltar (drop) de una tarjeta de tarea en una zona de soltado
async function drop(event) {
	let dropzoneAncestor = event.target.closest('.dropzone');

	if (!dropzoneAncestor) {
		return;
	}

	event.preventDefault();
	const taskId = event.dataTransfer.getData('text');
	const element = document.getElementById(taskId);

	const contenedorDia = dropzoneAncestor.closest('.contenedor-dia');
	const zoneBottom = dropzoneAncestor.closest('.zone-bottom');

	let newDay;

	if (contenedorDia) {
		newDay = contenedorDia.getAttribute('data-day');
	} else if (zoneBottom) {
		newDay = 'zone-bottom';
	} else {
		console.error('No se encontró el elemento .contenedor-dia o .zone-bottom');
		return;
	}

	const taskData = {
		id: element.getAttribute('data-id'),
		name: element.querySelector('.card-title').innerText,
		description: element.querySelector('.card-text').innerText,
		startTime: element
			.querySelector('.list-group-item:nth-child(1)')
			.innerText.replace('Hora de inicio: ', ''),
		endTime: element
			.querySelector('.list-group-item:nth-child(2)')
			.innerText.replace('Hora de final: ', ''),
		participants: element
			.querySelector('.list-group-item:nth-child(3)')
			.innerText.replace('Participantes: ', ''),
		location: element
			.querySelector('.list-group-item:nth-child(4)')
			.innerText.replace('Ubicación: ', ''),
		completed: element.querySelector('.form-check-input').checked,
	};

	await createOrUpdateTask(
		taskData.id,
		taskData.name,
		taskData.description,
		taskData.startTime,
		taskData.endTime,
		taskData.participants,
		taskData.location,
		taskData.completed,
		newDay,
		weekId,
		null,
		false
	);

	dropzoneAncestor.appendChild(element);
}

window.drop = drop;
let tarjetaAEditar;

let selectedDay = 'zone-bottom';
document.querySelectorAll('[data-day]').forEach((button) => {
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
iconoPapelera.classList.add(
	'bi',
	'bi-trash-fill',
	'ms-2',
	'eliminar-tarea',
	'text-danger'
);
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

	// Verificar si mensajeError no está vacío
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
		tarjetaAEditar.querySelector(
			'.list-group-item:nth-child(1)'
		).innerText = `Hora de inicio: ${horaInicio.value}`;
		tarjetaAEditar.querySelector(
			'.list-group-item:nth-child(2)'
		).innerText = `Hora de final: ${horaFinal.value}`;
		tarjetaAEditar.querySelector(
			'.list-group-item:nth-child(3)'
		).innerText = `Participantes: ${participantes.value}`;
		tarjetaAEditar.querySelector(
			'.list-group-item:nth-child(4)'
		).innerText = `Ubicación: ${ubicacion.value}`;
		tarjetaAEditar = null;
		const modal = bootstrap.Modal.getInstance(
			document.querySelector('#formtask')
		);
		await createOrUpdateTask(
			tarjetaAEditar.getAttribute('data-id'),
			nombreTarea.value,
			descripcion.value,
			horaInicio.value,
			horaFinal.value,
			participantes.value,
			ubicacion.value,
			completed.checked,
			selectedDay,
			weekId,
			adjunto.files[0]
		);
		modal.hide();
		form.reset();
	} else {
		const newTaskId = await createOrUpdateTask(
			null,
			nombreTarea.value,
			descripcion.value,
			horaInicio.value,
			horaFinal.value,
			participantes.value,
			ubicacion.value,
			completed.checked,
			selectedDay,
			weekId
		);
		console.log('NEWTASKID ' + newTaskId);

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
			dropzone = document.querySelector(
				`.contenedor-dia[data-day="${selectedDay}"] .dropzone`
			);
		} else {
			dropzone = document.querySelector('.contenedor-dia .dropzone');
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
		const modal = bootstrap.Modal.getInstance(
			document.querySelector('#formtask')
		);
		modal.hide();
		form.reset();
		const botonEliminar = tarjeta.querySelector('.eliminar-tarea');
		botonEliminar.addEventListener('click', async function () {
			selectedCard = tarjeta;
			const taskId = selectedCard.getAttribute('data-id');
			await deleteTask(taskId);
			const eliminarTareaModalEl =
				document.getElementById('eliminarTareaModal');
			const eliminarTareaModal = new bootstrap.Modal(eliminarTareaModalEl);
			eliminarTareaModal.show();
		});
		// Lapiz edicion
		const botonEditar = tarjeta.querySelector('.editar-tarea');
		botonEditar.addEventListener('click', function () {
			tarjetaAEditar = tarjeta;
			const titulo = tarjeta.querySelector('.card-title').innerText;
			const desc = tarjeta.querySelector('.card-text').innerText;
			const horaInicioTexto = tarjeta
				.querySelector('.list-group-item:nth-child(1)')
				.innerText.replace('Hora de inicio: ', '');
			const horaFinalTexto = tarjeta
				.querySelector('.list-group-item:nth-child(2)')
				.innerText.replace('Hora de final: ', '');
			const participantesTexto = tarjeta
				.querySelector('.list-group-item:nth-child(3)')
				.innerText.replace('Participantes: ', '');
			const ubicacionTexto = tarjeta
				.querySelector('.list-group-item:nth-child(4)')
				.innerText.replace('Ubicación: ', '');

			nombreTarea.value = titulo;
			descripcion.value = desc;
			horaInicio.value = horaInicioTexto;
			horaFinal.value = horaFinalTexto;
			participantes.value = participantesTexto;
			ubicacion.value = ubicacionTexto;
			const modal = new bootstrap.Modal(document.getElementById('formtask'));
			modal.show();
		});
		tarjeta.setAttribute('data-id', newTaskId);
	}
	form.reset(); // Reiniciar formulario para edición sin bugs!
});
document
	.getElementById('deleteButton')
	.addEventListener('click', async function () {
		const taskId = selectedCard.getAttribute('data-id');
		await deleteTask(taskId); // Elimina la tarea aquí.
		const tarjeta = document.getElementById(`tarjeta-${taskId}`);
		if (tarjeta) {
			tarjeta.remove();
		}
		const eliminarTareaModalEl = document.getElementById('eliminarTareaModal');
		const eliminarTareaModal =
			bootstrap.Modal.getInstance(eliminarTareaModalEl);
		eliminarTareaModal.hide();
	});

// Después de que se haya cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
	// Agrega un escucha de eventos a cada tarjeta de tarea
	const taskCards = document.querySelectorAll('.task-card');
	taskCards.forEach((card) => {
		// Obtén el ID de la tarea de un atributo de datos en la tarjeta
		const taskId = card.dataset.id;

		// Agrega un escucha de eventos al icono de clip en la tarjeta de tarea
		const clipIcon = card.querySelector('.clip-icon');
		clipIcon.addEventListener('click', () => {
			// Abre el modal de subida de archivos cuando se hace clic en el icono de clip
			uploadModal.show();
		});

		// Comprueba si la tarea tiene un archivo adjunto
		socket.emit('getTask', { id: taskId }, (response) => {
			if (response.success && response.task.fileUrl) {
				// Si la tarea tiene un archivo adjunto, muestra el texto "Archivo adjuntado" en la tarjeta
				const fileStatus = card.querySelector('.file-status');
				fileStatus.textContent = 'Archivo adjuntado';
			}
		});
	});
});

loadTasksFromDatabase();
