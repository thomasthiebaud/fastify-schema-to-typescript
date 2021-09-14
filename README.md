# fastify-schema-to-typescript

## How to install?

```sh
npm i -D fastify-schema-to-typescript
```

## How to use?

Running `npx fastify-schema-to-typescript` will convert all `schema.json` files in `src` to `schema.ts`.
You can then import `schema.ts` directly

```ts
import { RouteGeneric, schema } from "./schema";

const options = {
  schema: {
    params: schema.params,
    body: schema.body,
    response: schema.response,
  },
};

app.get<RouteGeneric>("/healthcheck", options, async () => {
  return { ok: true };
});
```

More options are available

```sh
npx fastify-schema-to-typescript -h

Usage: fastify-schema-to-typescript [options]

Options:
  -g, --glob <value>    glob matching JSON schema to convert (default: "src/**/schema.{json,yaml,yml}")
  -p, --prefix <value>  prefix to use before interfaces' name (default: "")
  -e, --ext <value>     file extension to use for generated files (default: ".ts")
  -m, --module <value>  module to import the RouteHandler type from (default: "fastify")
  -h, --help            display help for command
```

## Project example

Here is a project structure that I'm usually using with that module.
Each endpoint has a folder with a `schema.yaml` and `index.ts`

```
package.json
src/
  app.ts
  api/
    healthcheck/
      index.ts
      schema.yaml
    anotherEndpoint/
      index.ts
      schema.yaml
    ...
```

Running `npx fastify-schema-to-typescript` will convert `schema.yaml` to `schema.ts` that you can then import in your apps like that

app.ts

```ts
import fastify from "fastify";
import { healthcheck } from "./api";

export async function run() {
  const app = fastify();
  await app.register(healthcheck);

  await app.listen(3000);
}

run();
```

api/index.ts

```ts
export * from "./healthcheck";
```

api/healthcheck/schema.yaml

```yml
headers:
  type: object
  properties: ...

body:
  type: object
  properties: ...

query:
  type: object
  properties: ...

params:
  type: object
  properties: ...
```

api/healthcheck/index.ts

```ts
import { FastifyPluginAsync } from "fastify";
import { RouteGeneric, schema } from "./schema";

export const getHealthcheck: FastifyPluginAsync = async (app) => {
  app.get<RouteGeneric>("/healthcheck", { schema }, async () => {
    return { ok: true };
  });
};
```

I usually add the following in my package.json so I'm sure the code is in sync with the schemas

package.json

```
...
"scripts": {
  ...
  "build": "npm run clean && npm run generate && npm run compile",
  "compile": "tsc",
  "clean": "rimraf dist",
  "generate": "npx fastify-schema-to-typescript",
  ...
}
```

and I also update `.gitignore` to not include the generated `schema.ts`

.gitignore

```
...
schema.ts
...
```
