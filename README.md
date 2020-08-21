# fastify-schema-to-typescript

## How to install?

```
npm i -D fastify-schema-to-typescript
```

## How to use?

Running `npx fastify-schema-to-typescript` will convert all `schema.json` files in `src` to `schema.ts`.
You can then import `schema.ts` directly

```
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

```
npx fastify-schema-to-typescript -h

Usage: fastify-schema-to-typescript [options]

Options:
  -g, --glob <value>    glob matching JSON schema to convert (default: "src/**/schema.json")
  -p, --prefix <value>  prefix to use before interfaces' name (default: "")
  -e, --ext <value>     file extension to use for generated files (default: ".ts")
  -h, --help            display help for command
```
