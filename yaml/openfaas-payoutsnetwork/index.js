"use strict";

const express = require("express");
const proxy = require("express-http-proxy");
const { curry } = require("lodash");
const app = express();
//const bodyParser = require("body-parser");
const yaml = require("js-yaml");
const fs = require("fs");
const compose = require("docker-compose");
const path = require("path");

//app.use(bodyParser.json());
//app.use(bodyParser.raw());
//app.use(bodyParser.text({ type: "text/*" }));
//app.disable("x-powered-by");

const baseUrl = process.env.DOCKER_BASE_URL || "http://localhost";
const buildDir = process.env.DOCKER_BUILD_DIRECTORY || "build";
const dockerStartPort = process.env.DOCKER_START_PORT || 7000;
const dockerComposeFile = process.env.DOCKER_COMPOSE || "docker-compose.yml";
const deploymentFile = process.env.FAAS_DEPLOYMENT_FILE || "./deployment.yml";

const arrayToObject = curry(function({ objKey }, agg, item) {
  const key = item[objKey];
  //array destructuring to remove key immutably
  const { [objKey]: omit, ...newItem } = item;
  agg[key] = newItem;
  return agg;
});

function getDeployment() {
  return yaml.safeLoad(fs.readFileSync(deploymentFile, "utf8"));
}

function getFunctionNames() {
  return Object.keys(getDeployment().functions);
}

function getDockerServices(functionName, index) {
  const port = dockerStartPort + index;
  const handler = getDeployment().functions[functionName].handler;
  return {
    functionName,
    build: `./${buildDir}/${functionName}/`,
    command: `sh -c "cd /home/app; npm start"`,
    environment: [`NODE_ENV=development`],
    ports: [`${port}:3000`],
    working_dir: `/home/app`,
    volumes: [`${handler}:/home/app/function`]
  };
}

function getDockerObj() {
  return getFunctionNames()
    .map(getDockerServices)
    .reduce(arrayToObject({ objKey: "functionName" }), {});
}

function getDockerJson() {
  return {
    version: `3`,
    services: { ...getDockerObj() }
  };
}

function getDockerYaml() {
  return yaml.safeDump(getDockerJson());
}

function writeDockerCompose() {
  return new Promise(function(resolve, reject) {
    const dockerYaml = getDockerYaml();
    fs.writeFile(dockerComposeFile, dockerYaml, resolve);
  });
}

function buildAll() {
  return new Promise(function(resolve, reject) {
    compose
      .buildAll({ cwd: path.join(__dirname), log: true })
      .then(resolve)
      .catch(reject);
  });
}

function upAll() {
  return new Promise(function(resolve, reject) {
    compose
      .upAll({ cwd: path.join(__dirname), log: true })
      .then(resolve)
      .catch(reject);
  });
}

function handleProxy(functionName, index) {
  const path = getDeployment().functions[functionName].handler.slice(1);
  const port = dockerStartPort + index;
  app.use(path, proxy(`${baseUrl}:${port}`));
}

function startServer() {
  getFunctionNames().map(handleProxy);

  const port = process.env.http_port || 3000;
  app.listen(port, () => {
    console.log(`OpenFaaS Node.js listening on port: ${port}`);
  });
}

writeDockerCompose()
  .then(buildAll)
  .then(upAll)
  .then(startServer);
