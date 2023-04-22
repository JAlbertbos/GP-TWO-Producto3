const Task = require("../models/Task");

exports.getTasks = async () => {
  try {
    return await Task.find().populate("week");
  } catch (err) {
    console.error(err);
    throw new Error("Error retrieving tasks");
  }
};

exports.getTaskById = async (id) => {
  try {
    return await Task.findById(id).populate("week");
  } catch (err) {
    console.error(err);
    throw new Error("Error retrieving task");
  }
};

exports.createTask = async (taskData) => {
  try {
    const newTask = new Task(taskData);
    return await newTask.save();
  } catch (err) {
    console.error(err);
    throw new Error("Error creating task");
  }
};

exports.updateTaskById = async (id, updatedData) => {
  try {
    return await Task.findByIdAndUpdate(id, updatedData, { new: true });
  } catch (err) {
    console.error(err);
    throw new Error("Error updating task");
  }
};

exports.deleteTaskById = async (id) => {
  try {
    await Task.findByIdAndRemove(id);
  } catch (err) {
    console.error(err);
    throw new Error("Error deleting task");
  }
};
