"use strict";

module.exports = async (event, context) => {
  let err;
  const knex = context.db.knex();
  const r = await knex.select().from("states");
  const result = {
    body: r
  };

  context.status(200).succeed(result);
};
