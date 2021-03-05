# fastify-schema-to-typescript

## How to install?

```sh
npm i -D fastify-schema-to-typescript
```

## How to use?

Running `npx fastify-schema-to-typescript` will convert all `schema.json` files in `src` to `schema.ts`.
You can then import `schema.ts` directly

```ts
import { Handler, schema } from "./schema";

export const options = {
  schema: {
    params: schema.params,
    body: schema.body,
    response: schema.response,
  },
};

export const handler: Handler = async (request, reply) => {}
```

More options are available

```sh
npx fastify-schema-to-typescript -h

Usage: fastify-schema-to-typescript [options]

Options:
  -g, --glob <value>    glob matching JSON schema to convert (default: "src/**/schema.json")
  -p, --prefix <value>  prefix to use before interfaces' name (default: "")
  -e, --ext <value>     file extension to use for generated files (default: ".ts")
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
    healtheck/
      index.ts
      schema.yaml
    anotherEndpoint/
      index.ts
      schema.yaml
    ...
```

Running `npx fastify-schema-to-typescript` will convert `schema.yaml` to `schema.ts` that you can then you in your apps like that

app.ts

```ts
import fastify from 'fastify';
import { healthcheck } from './api'

export async function run() {
  const app = fastify();
  await app.register(healthcheck);

  await app.listen(3000);
}

run();
```

api/index.ts

```ts
export * from './healthcheck';
```

api/healtheck/schema.yaml

```yml
headers:
  type: object
  properties:
    ...

body:
  type: object
  properties:
    ...

query:
  type: object
  properties:
    ...

params:
  type: object
  properties:
    ...
```

api/healtheck/index.ts

```ts
import { FastifyPluginAsync } from 'fastify';
import { RouteGeneric, schema } from './schema';

export const getHealthcheck: FastifyPluginAsync = async (app) => {
  app.get<RouteGeneric>('/healthcheck', { schema }, async () => {
    return { ok: true };
  });
};
```

I usually add the following in my package.json so I'm sure the code is in syn with the schemas

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

and I also update `.gitignore` to not include the generate `schema.ts`

.gitignore

```
...
schema.ts
...
```
