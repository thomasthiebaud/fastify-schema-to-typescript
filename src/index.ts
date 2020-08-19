import glob from "glob";
import path from "path";
import fs from "fs";
import { compile } from "json-schema-to-typescript";

const opts = { bannerComment: "" };
const defaultSchema = { type: "object", additionalProperties: false };

async function generateReplyInterfaces(prefix: string, replies = {}) {
  const generatedInterfaces = [];
  const generatedReplyNames = [];
  for (const [replyCode, replySchema] of Object.entries<any>(replies)) {
    generatedReplyNames.push(prefix + replyCode + "Reply");
    generatedInterfaces.push(
      await compile(
        replySchema || defaultSchema,
        prefix + replyCode + "Reply",
        opts
      )
    );
  }

  return `
${generatedInterfaces.join("\n")}

interface ${prefix}Reply = ${generatedReplyNames.join(" | ")}
`;
}

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

import { RouteHandler } from "fastify"

import schema from './${parsedPath.base}'

${await compile(schema.params || defaultSchema, prefix + "Params", opts)}
${await compile(
  schema.querystring || schema.query || defaultSchema,
  prefix + "Query",
  opts
)}
${await compile(schema.body || defaultSchema, prefix + "Body", opts)}
${await compile(schema.headers || defaultSchema, prefix + "Headers", opts)}
${await generateReplyInterfaces(prefix, schema.response)}

type Handler = RouteHandler<{
  Query: ${prefix}Query;
  Body: ${prefix}Body;
  Params: ${prefix}Params;
  Headers: ${prefix}Headers;
  Reply: ${prefix}Reply;
}>;

export { Handler, schema }
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
