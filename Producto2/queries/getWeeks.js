const Week = require('/models/week');

async function getWeeks() {
  try {
    const weeks = await Week.find();
    return weeks;
  } catch (error) {
    console.error('Error al obtener las semanas: ', error);
    throw error;
  }
}

module.exports = getWeeks;
