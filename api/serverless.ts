"use strict";

import * as dotenv from "dotenv";
import fastify from "fastify";
import { FastifyCookieOptions } from "fastify-cookie";
import wordnet from "wordnet";

dotenv.config();

const app = fastify({
  logger: true,
});

app.register(require('fastify-cookie'), {
  secret: "dictry",
  parseOptions: {}
} as FastifyCookieOptions)

app.register(import("../functions/app"), {
    prefix: '/'
});

export default async (req, res) => {
    await wordnet.init('./node_modules/wordnet/db');
    await app.ready();
    app.server.emit('request', req, res);
}