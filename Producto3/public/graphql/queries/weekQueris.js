const { GraphQLID, GraphQLList } = require("graphql");
const Week = require("../models/Week");
const WeekType = require("../types/WeekType");

const weekQueries = {
  week: {
    type: WeekType,
    args: { id: { type: GraphQLID } },
    async resolve(parent, args) {
      return await Week.findById(args.id);
    },
  },
  weeks: {
    type: new GraphQLList(WeekType),
    async resolve(parent, args) {
      return await Week.find();
    },
  },
};

module.exports = weekQueries;
