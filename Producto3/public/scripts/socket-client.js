const socket = io();

socket.on('error', (error) => {
  console.error('Error en el socket:', error);
});

// Enviar una solicitud al servidor
socket.emit('request', { yourData: 'example' }, (response) => {
  // Procesar la respuesta del servidor
  if (response.status === 'ok') {
    console.log('Request processed correctly');
  } else {
    console.log('Request failed');
  }
});

// Puedes agregar más eventos y funciones según sea necesario
