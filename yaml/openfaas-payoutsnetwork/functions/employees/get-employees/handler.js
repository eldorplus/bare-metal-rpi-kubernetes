"use strict";

module.exports = async (event, context) => {
  let err;
  const knex = context.db.knex();
  let r;
  const { page, perPage, sort, sortDirection } = {
    ...event.body
  };

  if (sort && sortDirection) {
    r = await knex
      .select("employees.*", "states.abbreviation as state_abbreviation")
      .from("employees")
      .leftJoin("states", "employees.state_id", "states.id")
      .orderBy(sort, sortDirection)
      .paginate(page, perPage);
  } else {
    r = await knex
      .select("employees.*", "states.abbreviation as state_abbreviation")
      .from("employees")
      .leftJoin("states", "employees.state_id", "states.id")
      .paginate(page, perPage);
  }

  const result = {
    statusCode: 200,
    body: JSON.stringify(r),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    isBase64Encoded: false
  };

  context.status(200).succeed(result);
};
