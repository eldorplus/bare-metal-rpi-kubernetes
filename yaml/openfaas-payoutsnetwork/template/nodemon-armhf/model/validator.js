const db = require("../db/dbconfig.js");
const knex = db.knex();

module.exports = async function Validate(model, body) {
  const uniqueKeys = model.uniqueKeys || [];

  //validate model
  try {
    model.fromJson(body);
  } catch (e) {
    console.log(e);
    return {
      status: "fail",
      response: {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        isBase64Encoded: false,
        body: "error: " + e
      }
    };
  }

  for (var i = 0, len = uniqueKeys.length; i < len; i++) {
    var obj = {};
    const key = uniqueKeys[i];
    obj[key] = body[key];

    const s = await knex(model.tableName).where({ ...obj });
    if (s.length !== 0) {
      return {
        status: "fail",
        response: {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
            "Access-Control-Allow-Headers": "Content-Type"
          },
          isBase64Encoded: false,
          body: "error: " + key + "MustBeUnique"
        }
      };
    }
  }

  return {
    status: "success"
  };
};
