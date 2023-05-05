const Week = require('/models/week');

const deleteWeek = async (req, res) => {
  try {
    const { id } = req.params;
    await Week.findByIdAndDelete(id);
    res.status(200).json({ message: 'Semana eliminada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la semana' });
  }
};

module.exports = deleteWeek;