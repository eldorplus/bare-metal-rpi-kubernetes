"use strict";
module.exports = async (event, context) => {
  let err;
  let knex = event.knex;
  let r;
  const { page, perPage, sort, sortDirection } = {
    ...event.body
  };
  r = await knex
    .select("employees.*", "states.abbreviation as state_abbreviation")
    .from("employees")
    .leftJoin("states", "employees.state_id", "states.id")
    .paginate(page, perPage);
  const result = {
    body: r
  };

  context.status(200).succeed(result);
};
