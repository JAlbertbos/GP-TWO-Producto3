const Week = require('/models/week');

async function getWeekById(weekId) {
  try {
    const week = await Week.findById(weekId);
    return week;
  } catch (error) {
    console.error('Error al obtener la semana por ID: ', error);
    throw error;
  }
}

module.exports = getWeekById;
