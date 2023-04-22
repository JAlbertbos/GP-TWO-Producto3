const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLBoolean,
  } = require("graphql");
  const WeekType = require("./WeekType");
  
  const TaskType = new GraphQLObjectType({
    name: "Task",
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      description: { type: GraphQLString },
      startTime: { type: GraphQLString },
      endTime: { type: GraphQLString },
      participants: { type: GraphQLString },
      location: { type: GraphQLString },
      completed: { type: GraphQLBoolean },
      week: {
        type: WeekType,
        resolve(parent, args) {
          return Week.findById(parent.week);
        },
      },
    }),
  });
  
  module.exports = TaskType;
  