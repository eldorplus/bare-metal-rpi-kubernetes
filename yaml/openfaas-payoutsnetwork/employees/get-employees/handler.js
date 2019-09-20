"use strict";
const fs require('fs')
const mysqlHostFile = '/var/openfaas/secrets/mysql-host'
const encoding = 'utf-8'

module.exports = (event, context) => {
  let err;
  const host = fs.readFileSync(mysqlHostFile, encoding)
  const result = {
    mysqlHost: host,
    status: "You said: " + host,
    more: "this is another key value pair",
  };

  context.status(200).succeed(result);
};
