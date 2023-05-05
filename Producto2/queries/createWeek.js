const Week = require('/models/week');

async function createWeek(weekData) {
  try {
    const newWeek = new Week(weekData);
    const savedWeek = await newWeek.save();
    return savedWeek;
  } catch (error) {
    console.error('Error al crear la semana: ', error);
    throw error;
  }
}

module.exports = createWeek;
