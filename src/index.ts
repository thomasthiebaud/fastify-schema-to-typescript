import glob from "glob";
import path from "path";
import fs from "fs";
import { compile } from "json-schema-to-typescript";

const opts = { bannerComment: "" };
const defaultSchema = { type: "object", additionalProperties: false };

async function writeFile(
  parsedPath: path.ParsedPath,
  prefix: string,
  schema: any
) {
  const template = `/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the corresponding JSONSchema file and regenerate the types.
 */

import { FastifyReply, FastifyRequest } from 'fastify'
import { ServerResponse } from "http"
import { Http2ServerResponse } from "http2"

import schema from './${parsedPath.base}'

${await compile(schema.params || defaultSchema, prefix + "Params", opts)}
${await compile(
  schema.querystring || schema.query || defaultSchema,
  prefix + "Query",
  opts
)}
${await compile(schema.body || defaultSchema, prefix + "Body", opts)}
${await compile(schema.headers || defaultSchema, prefix + "Headers", opts)}

interface ${prefix}Reply extends FastifyReply<ServerResponse | Http2ServerResponse> {}

interface ${prefix}Request extends FastifyRequest {
  params: ${prefix}Params,
  query: ${prefix}Query,
  body: ${prefix}Body,
  headers: ${prefix}Headers,
}

export { schema, Reply, Request }
  `;

  fs.writeFileSync(
    path.join(parsedPath.dir, parsedPath.name + ".ts"),
    template
  );
}

export function convert(globString: string, prefix: string) {
  const filePaths = glob.sync(globString);
  filePaths.forEach((filePath) => {
    const parsedPath = path.parse(filePath);
    const schema = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    writeFile(parsedPath, prefix, schema);
  });
}
