"use strict";

module.exports = async (event, context) => {
  let err;
  const body = event.body;
  const { Employee } = context.models;
  try {
    const r = await Employee.query()
      .patch({ status: "active" })
      .where("id", body.id);

    const result = {
      statusCode: 200,
      body: "User activated",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
        "Access-Control-Allow-Headers": "content-type"
      },
      isBase64Encoded: false
    };
    context.status(200).succeed(result);
  } catch (e) {
    //console.log(e);
    const result = {
      statusCode: 400,
      body: "error: " + e,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH,DELETE",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      isBase64Encoded: false
    };
    context.status(400).fail(result);
  }

  context.status(200).succeed(result);
};
