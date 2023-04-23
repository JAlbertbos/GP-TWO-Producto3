const createWeekForm = document.getElementById('cardForm');

createWeekForm.addEventListener('submit', event => {
  event.preventDefault();
  
  const nameInput = document.getElementById('name');
  const weekInput = document.getElementById('week');
  const priorityInput = document.getElementById('priority');
  const yearInput = document.getElementById('year');
  const colorInput = document.querySelector('.circle.active').dataset.color;
  const descriptionInput = document.getElementById('description');

  // definir variables para la consulta GraphQL
  const variables = {
    name: nameInput.value,
    week: parseInt(weekInput.value),
    priority: parseInt(priorityInput.value),
    year: parseInt(yearInput.value),
    color: colorInput,
    description: descriptionInput.value,
  };

  // definir la consulta GraphQL
  const query = `
    mutation createWeek($name: String!, $week: Int!, $priority: Int!, $year: Int!, $color: String!, $description: String) {
      createWeek(name: $name, week: $week, priority: $priority, year: $year, color: $color, description: $description) {
        id
        name
        week
        priority
        year
        color
        description
      }
    }
  `;

  // enviar la solicitud GraphQL utilizando Fetch
  fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
    .then(response => {
      if (response.ok) {
        // si la respuesta es exitosa, refrescar la página para mostrar la nueva semana
        location.reload();
      } else {
        // si la respuesta no es exitosa, mostrar un mensaje de error
        throw new Error('Error al crear la semana');
      }
    })
    .catch(error => {
      // mostrar el mensaje de error en un modal genérico
      const genericModal = new bootstrap.Modal(document.getElementById('genericModal'));
      const genericModalMessage = document.getElementById('genericModalMessage');
      genericModalMessage.textContent = error.message;
      genericModal.show();
    });
});
