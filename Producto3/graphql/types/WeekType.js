const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
  } = require("graphql");
  const TaskType = require("./TaskType");
  
  const WeekType = new GraphQLObjectType({
    name: "Week",
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      numberWeek: { type: GraphQLInt },
      priority: { type: GraphQLInt },
      year: { type: GraphQLInt },
      description: { type: GraphQLString },
      borderColor: { type: GraphQLString },
      tasks: {
        type: new GraphQLList(TaskType),
        resolve(parent, args) {
          return Task.find({ week: parent.id });
        },
      },
    }),
  });
  
  module.exports = WeekType;
  