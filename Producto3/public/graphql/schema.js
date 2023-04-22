const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const taskQueries = require("./queries/taskQueries");
const taskMutations = require("./mutations/taskMutations");
const weekQueries = require("./queries/weekQueries");
const weekMutations = require("./mutations/weekMutations");


const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ...taskQueries,
    ...weekQueries,
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    ...taskMutations,
    ...weekMutations,
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});


