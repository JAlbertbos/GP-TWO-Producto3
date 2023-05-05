const Week = require('/models/week');

async function updateWeek(weekId, weekData) {
  try {
    const updatedWeek = await Week.findByIdAndUpdate(weekId, weekData, { new: true });
    return updatedWeek;
  } catch (error) {
    console.error('Error al actualizar la semana: ', error);
    throw error;
  }
}

module.exports = updateWeek;