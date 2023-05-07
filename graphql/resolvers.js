// graphql/resolvers.js
const Task = require('../models/Task');
const Week = require('../models/Week');

const resolvers = {
  tasks: async () => {
    return await Task.find().populate('week');
  },
  task: async (args) => {
    return await Task.findById(args.id).populate('week');
  },
  createTask: async (args) => {
    const week = await Week.findById(args.weekId);
    if (!week) {
      throw new Error('La semana no existe');
    }

    const newTask = new Task({
      title: args.title,
      description: args.description,
      dueDate: args.dueDate ? new Date(args.dueDate) : null,
      week: week,
    });

    const savedTask = await newTask.save();
    week.tasks.push(savedTask);
    await week.save();

    return savedTask;
  },
  updateTask: async (args) => {
    const update = {
      ...(args.title && { title: args.title }),
      ...(args.description && { description: args.description }),
      ...(args.dueDate && { dueDate: new Date(args.dueDate) }),
      ...(args.weekId && { week: args.weekId }),
    };

    return await Task.findByIdAndUpdate(args.id, update, { new: true }).populate('week');
  },
  deleteTask: async (args) => {
    return await Task.findByIdAndDelete(args.id);
  },
  weeks: async () => {
    return await Week.find().populate('tasks');
  },
  week: async (args) => {
    return await Week.findById(args.id).populate('tasks');
  },
  createWeek: async (args) => {
    const newWeek = new Week({
      name: args.name,
      week: args.week,
      priority: args.priority,
      year: args.year,
      description: args.description,
      color: args.color,
    });

    return await newWeek.save();
  },
  updateWeek: async (args) => {
    const update = {
      ...(args.name && { name: args.name }),
      ...(args.week && { week: args.week }),
      ...(args.priority && { priority: args.priority }),
      ...(args.year && { year: args.year }),
      ...(args.description && { description: args.description }),
      ...(args.color && { color: args.color }),
    };

    return await Week.findByIdAndUpdate(args.id, update, { new: true }).populate('tasks');
  },
  
  deleteWeek: async (args) => {
    return await Week.findByIdAndDelete(args.id);
  },
};

module.exports = resolvers;
