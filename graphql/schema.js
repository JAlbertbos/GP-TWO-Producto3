// graphql/schema.js
const { buildSchema } = require('graphql');

const schema = buildSchema(`
type Task {
  id: ID!
  title: String!
  description: String
  dueDate: String
  week: Week
}

type Week {
  id: ID!
  name: String!
  week: Int!
  priority: String!
  year: Int!
  description: String!
  color: String!
  tasks: [Task]
}

  type Query {
    tasks: [Task]
    task(id: ID!): Task
    weeks: [Week]
    week(id: ID!): Week
  }

  type Mutation {
    createWeek(name: String!, week: Int!, priority: String!, year: Int!, description: String!, color: String!): Week
    updateWeek(id: ID!, name: String, week: Int, priority: String, year: Int, description: String, color: String): Week
    updateTask(id: ID!, title: String, description: String, dueDate: String, weekId: ID): Task
    deleteTask(id: ID!): Task
    deleteWeek(id: ID!): Week
  }
`);

module.exports = schema;
