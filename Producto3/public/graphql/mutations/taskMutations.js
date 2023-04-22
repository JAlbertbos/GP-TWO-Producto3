const { 
  GraphQLObjectType,
  GraphQLString, 
  GraphQLID, 
  GraphQLBoolean,
  GraphQLNonNull,
 } = require("graphql");
const Task = require("../models/Task");
const TaskType = require("../types/TaskType");

const taskMutations = new GraphQLObjectType({
  name: "TaskMutations",
  fields: {
    createTask: {
      type: TaskType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        startTime: { type: new GraphQLNonNull(GraphQLString) },
        endTime: { type: new GraphQLNonNull(GraphQLString) },
        participants: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: new GraphQLNonNull(GraphQLString) },
        week: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        const taskData = {
          ...args,
          completed: false,
        };
        const newTask = new Task(taskData);
        return newTask.save();
      },
    },
    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        startTime: { type: GraphQLString },
        endTime: { type: GraphQLString },
        participants: { type: GraphQLString },
        location: { type: GraphQLString },
        completed: { type: GraphQLBoolean },
        week: { type: GraphQLID },
      },
      async resolve(parent, args) {
        const updatedData = { ...args };
        delete updatedData.id;
        return await Task.findByIdAndUpdate(args.id, updatedData, { new: true });
      },
    },
    deleteTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        return await Task.findByIdAndRemove(args.id);
      },
    },
  },
});

module.exports = taskMutations;
