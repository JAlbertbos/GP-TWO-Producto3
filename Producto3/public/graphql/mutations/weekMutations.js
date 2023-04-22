const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,
  } = require("graphql");
  const Week = require("../models/Week");
  const WeekType = require("../types/WeekType");
  
  const weekMutations = new GraphQLObjectType({
    name: "WeekMutations",
    fields: {
      createWeek: {
        type: WeekType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          numberWeek: { type: new GraphQLNonNull(GraphQLInt) },
          priority: { type: new GraphQLNonNull(GraphQLInt) },
          year: { type: new GraphQLNonNull(GraphQLInt) },
          description: { type: new GraphQLNonNull(GraphQLString) },
          borderColor: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve(parent, args) {
          const weekData = { ...args };
          const newWeek = new Week(weekData);
          return newWeek.save();
        },
      },
      updateWeek: {
        type: WeekType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          name: { type: GraphQLString },
          numberWeek: { type: GraphQLInt },
          priority: { type: GraphQLInt },
          year: { type: GraphQLInt },
          description: { type: GraphQLString },
          borderColor: { type: GraphQLString },
        },
        async resolve(parent, args) {
          const updatedData = { ...args };
          delete updatedData.id;
          return await Week.findByIdAndUpdate(args.id, updatedData, { new: true });
        },
      },
      deleteWeek: {
        type: WeekType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        async resolve(parent, args) {
          return await Week.findByIdAndRemove(args.id);
        },
      },
    },
  });
  
  module.exports = weekMutations;
  