"use strict";
const knex = require("../../configs/dbConfig.js");
module.exports = async (event, context) => {
  let err;
  let r;
  const { page, perPage, sort, sortDirection } = {
    ...JSON.parse(event.body)
  };
  r = await knex
    .select("employees.*", "states.abbreviation as state_abbreviation")
    .from("employees")
    .leftJoin("states", "employees.state_id", "states.id")
    .paginate(page, perPage);
  const result = {
    status: "success"
  };

  context.status(200).succeed(result);
};
