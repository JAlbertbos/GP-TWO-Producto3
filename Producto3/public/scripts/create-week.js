function priorityToString(priority) {
  switch (parseInt(priority)) {
    case 1:
      return "Alta";
    case 2:
      return "Media";
    case 3:
      return "Baja";
    default:
      return "";
  }
}

let tarjetaAEditar;

function renderWeeks(weeks) {
  removeExistingCards();
  weeks.forEach((week) => {
    addCardToDOM(
      week._id,
      week.name,
      week.numberWeek,
      week.priority,
      week.year,
      week.description,
      week.borderColor
    );
  });
}

async function graphqlFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    });

    const jsonResponse = await response.json();

    if (jsonResponse.errors) {
      throw new Error(jsonResponse.errors[0].message);
    }

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return jsonResponse.data;
  } catch (error) {
    console.error('Error in graphqlFetch:', error);
    throw error;
  }
}


async function saveWeekToServer(name, numberWeek, priority, year, description, borderColor) {
  try {
    const query = `
      mutation CreateWeek($week: WeekInput!) {
        createWeek(week: $week) {
          _id
          name
          numberWeek
          priority
          year
          description
          borderColor
        }
      }
    `;

    const variables = {
      week: {
        name,
        numberWeek: parseInt(week),
        priority,
        year: parseInt(year),
        description,
        borderColor,
      },
    };

    const response = await graphqlFetch(query, variables); 
    const createdWeek = response.createWeek;

    if (createdWeek !== null && createdWeek.hasOwnProperty('_id')) {
      return createdWeek._id;
    } else {
      throw new Error("Error: La respuesta del servidor es nula o no tiene la propiedad _id");
    }
  } catch (error) {
    console.error('Error al guardar la semana:', error);
  }
}


// DOM

function removeExistingCards() {
  const mainRow = document.querySelector("main .row");
  const cardContainers = mainRow.querySelectorAll(".col-md-4.mb-4");
  cardContainers.forEach((cardContainer) => {
    cardContainer.remove();
  });
}


async function addCardToDOM(id, name, numberWeek, priority, year, description, color) {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("col-md-4", "mb-4");

  const priorityText = priorityToString(priority);

  const card = `
    <div class="card shadow-sm card-square" data-id="${id}" style="border-color: ${color}">
      <div class="card-body">
        <h5 class="card-title"><b>${name}</b></h5>
        <p class ="card-text">Semana: ${numberWeek}</p>
        <p class ="card-text">Prioridad: "${priorityText}"</p>
        <p class ="card-text">Año: ${year}</p>
        <p class ="card-text">Descripcion: ${description}</p>
      </div>
      <div class="card-icons d-flex justify-content-between position-absolute bottom-0 start-0 end-0">
        <a href="./Weektasks.html?weekId=${id}" class="card-link"><i class="bi bi-eye"></i></a>
        <a href="#" class="card-link">
          <i class="bi bi-trash delete-icon" data-bs-toggle="modal" data-bs-target="#eliminarTarjetaModal" data-card="${id}"></i>
          <button type="button" class="btn btn-link p-0 editar-week"><i class="bi bi-pencil-square text-primary"></i></button>
        </a>
      </div>
    </div>
  `;

  cardContainer.innerHTML = card;

  const mainRow = document.querySelector("main .row");
  mainRow.appendChild(cardContainer);

  const editButton = cardContainer.querySelector(".editar-week");
editButton.addEventListener("click", async () => {
  tarjetaAEditar = cardContainer;


const name = cardContainer.querySelector('.card-title');
const description = cardContainer.querySelector('.card-text');
const numberWeek = cardContainer.querySelector('.list-group-item:nth-child(1)');
const color = cardContainer.querySelector('.card shadow-sm card-square');
const priority = cardContainer.querySelector('.list-group-item:nth-child(2)');
const year = cardContainer.querySelector('.list-group-item:nth-child(3)');


  const modal = new bootstrap.Modal(document.getElementById("formweek"));
  modal.show();
});

}


async function createCard(name, numberWeek, priority, year, description, color) {
  const id = await saveWeekToServer(name, numberWeek, priority, year, description, color);
  if (id) {
    addCardToDOM(id, name, numberWweek, priority, year, description, color);
  }
}


async function loadWeeks() {
  try {
    const query = `{
      getAllWeeks {
        _id
        name
        numberWeek
        priority
        year
        description
        borderColor
        tasks {
          _id
          name
          description
          startTime
          endTime
          participants
          location
          completed
        }
      }
    }`;

    const data = await graphqlFetch(query);
    renderWeeks(data.getAllWeeks);
  } catch (error) {
    console.error('Error al cargar las semanas:', error);
  }
}


// Eventos

document.addEventListener("DOMContentLoaded", async () => {
  const confirmBtn = document.getElementById("confirmButton");
  const cardForm = document.getElementById("cardForm");

  let selectedColor = "black";
  const circles = document.querySelectorAll(".circle");
  const description = document.querySelector("textarea");

  circles.forEach(circle => {
      circle.addEventListener("click", () => {
          selectedColor = circle.classList[1];
          description.style.borderColor = selectedColor;
      });
  });

  confirmBtn.addEventListener("click", async (e) => {
    var formulario = document.getElementById("cardForm");
    var inputsRequeridos = formulario.querySelectorAll("[required]");
    var valido = true;
  
    for (var i = 0; i < inputsRequeridos.length; i++) {
      if (!inputsRequeridos[i].value) {
        valido = false;
        break;
      }
    }
  
    if (valido) {
      e.preventDefault();
      let name = document.getElementById("name").value;
      let numberWeek = document.getElementById("numberWeek").value;
      let priority = parseInt(document.getElementById("priority").value);
      let year = document.getElementById("year").value;
      let description = document.getElementById("description").value;
  
      
      if (name.trim() === "") {
        mostrarModal("Por favor ingrese un nombre válido.");
        return;
      }
  
      
      const weekRegex = /^(0?[1-9]|[1-4][0-9]|5[0-3])$/;
      if (!weekRegex.test(week)) {
        mostrarModal("Por favor ingrese un número de semana válido (entre 01 y 53).");
        return;
      }
  
      
      if (![1, 2, 3].includes(priority)) {
        mostrarModal("Por favor seleccione una prioridad válida (Alta, Media o Baja).");
        return;
      }
  
      
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(year)) {
        mostrarModal("Por favor ingrese un año válido (formato: AAAA).");
        return;
      }
  
      
      if (description.trim() === "") {
        mostrarModal("Por favor ingrese una descripción válida.");
        return;
      }
  
      await createCard(name, numberWeek, priority, year, description, selectedColor);
  
     
      await loadWeeks();
  
      
      const nuevaSemanaModal = document.getElementById("nuevaSemanaModal");
      const modal = bootstrap.Modal.getInstance(nuevaSemanaModal);
      modal.hide();
  
      
      cardForm.reset();
    } else {
      mostrarModal("Faltan campos por completar");
    }
  });
  document.querySelectorAll(".delete-icon").forEach((deleteIcon) => {
    deleteIcon.addEventListener("click", (e) => {
      e.preventDefault();
      const cardContainer = e.target.closest(".col-md-4.mb-4");
      deleteCard(cardContainer);
    });
  });

  loadWeeks();
});

export { graphqlFetch, renderWeeks };
