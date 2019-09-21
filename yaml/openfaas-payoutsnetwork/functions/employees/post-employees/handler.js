"use strict";

module.exports = async (event, context) => {
  let err;
  const { Validate, Employee } = context.models;

  const validationStatus = await Validate(Employee, event.body);

  if (validationStatus.status === "success") {
    const r = await Employee.query().insert(body);

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
  } else {
    const result = validationStatus.response;
    context.status(400).fail(result);
  }
};
