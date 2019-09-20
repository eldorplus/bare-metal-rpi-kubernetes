"use strict";

module.exports = (event, context) => {
  let err;
  const result = {
    status: "You said: " + JSON.stringify(event.body),
    mysqlHost: process.env["mysql-host"]
  };

  context.status(200).succeed(result);
};
