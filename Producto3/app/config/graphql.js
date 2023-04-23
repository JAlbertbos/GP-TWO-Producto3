
const tasksController = require('../controllers/TasksController');
const weeksController = require('../controllers/WeeksController');

const { gql } = require('apollo-server-express');

const typeDefs = gql`
scalar ID

type Week {
  _id: ID
  name: String
  numberWeek: Int
  priority: Int
  year : Int
  description: String
  borderColor: String
  tasks: [Task]
}

type Task {
  _id: ID
  name: String 
  description: String
  startTime: String
  endTime: String
  participants: String
  location:String
  completed: Boolean
  week: Week
}
  input WeekInput {
    name: String
    numberWeek: Int
    priority: Int
    year: Int
    description: String
    borderColor: String
  }
  
  input TaskInput {
    name: String
    description: String
    startTime: String
    endTime: String
    participants: String
    location: String
    completed: Boolean
    week: String
  }

  type Query {
    getAllWeeks: [Week]
    getWeekById(id: String): Week
    getAllTasks: [Task]
    getTaskById(id: String): Task
  }
  
  type Mutation {
    createWeek(week: WeekInput): Week
    deleteWeek(id: String): Week
    createTask(taskData: TaskInput!, weekId: ID!): Task
    updateTask(id: String, task: TaskInput): Task
    deleteTask(id: String): Task
  }
`;

const resolvers = {
    Query: {
      getAllWeeks: () => weeksController.getWeeks(),
      getWeekById: (_, { id }) => weeksController.getWeekById(id),
      getAllTasks: () => tasksController.getTasks(),
      getTaskById: (_, { id }) => tasksController.getTaskById(id),
    },
    Mutation: {
      createWeek: (_, { week }) => weeksController.createWeek(week),
      deleteWeek: (_, { id }) => weeksController.deleteWeekById(id),
      createTask: (_, { taskData, weekId }) => tasksController.createTask(taskData, weekId),
      updateTask: (_, { id, task }) => tasksController.updateTask(id, task),
      deleteTask: (_, { id }) => tasksController.deleteTask(id),
    },
  };

module.exports = {
  typeDefs,
  resolvers,
};

