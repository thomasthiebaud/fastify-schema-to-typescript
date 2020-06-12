# fastify-schema-to-typescript

## How to install?

```
npm i -D fastify-schema-to-typescript
```

## How to use?

Running `npx fastify-schema-to-typescript` will convert all `schema.json` files in `src` to `schema.ts`.
You can then import `schema.ts` directly

```
import { Request, Reply, schema } from "./schema";

export const options = {
  schema: {
    params: schema.params,
    body: schema.body,
    response: schema.response,
  },
};

export async function handler(request: Request, reply: Reply) {}
```

More options are available

```
npx fastify-schema-to-typescript -h

Options:
  -g, --glob <value>    glob matching JSON schema to convert (default: "src/**/schema.json")
  -p, --prefix <value>  prefix to use before interfaces' name (default: "")
  -h, --help            display help for command
```
