/* eslint-disable @typescript-eslint/no-var-requires */
const OpenAPIBackend = require("openapi-backend").default;
const express = require("express");
const handlers = require("./handlers");
const path = require('path');
var cors = require('cors');

const app = express();
app.use(express.json());

// define api
const api = new OpenAPIBackend({ definition: path.join(__dirname, "../kas-fleet-manager.yaml") });

// register handlers
api.register(handlers);
app.use(cors());

// register security handler
api.registerSecurityHandler("Bearer", (c, req, res) => {
  return true;

  // const authHeader = c.request.headers['authorization'];
  // if (!authHeader) {
  //   throw new Error('Missing authorization header');
  // }
  // const token = authHeader.replace('Bearer ', '');
  // return jwt.verify(token, 'secret');
});

api.init();

// use as express middleware
app.use((req, res) => api.handleRequest(req, req, res));

const port = 8000;

// start server
app.listen(port, () => console.info(`mock api listening at http://localhost:${port}`));
