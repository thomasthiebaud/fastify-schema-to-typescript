import {
  generateDefinitionInterfaces,
  generateReplyInterfaces,
  generateInterfaces,
  defaultOptions,
  addDefaultValueToSchema,
} from "../src/schema";

describe("#generateReplyInterfaces", () => {
  it("should generate the reply interface with an empty schema", async () => {
    expect(await generateReplyInterfaces("")).toEqual("export type Reply = {}");
    expect(await generateReplyInterfaces("XXX")).toEqual(
      "export type XXXReply = {}",
    );
  });

  it("should generate the reply interface with a single schema", async () => {
    const schema = {
      "2xx": {
        additionalProperties: false,
        properties: {
          guid: {
            type: "string",
          },
        },
        type: "object",
      },
    };
    const genertatedInterface = `\
export interface Reply2XX {
  guid?: string;
}

export type Reply = Reply2XX\
`;

    expect(await generateReplyInterfaces("", schema)).toEqual(
      genertatedInterface,
    );
  });

  it("should generate the reply interface with a multiple schema", async () => {
    const schema = {
      "2xx": {
        additionalProperties: false,
        properties: {
          guid: {
            type: "string",
          },
        },
        type: "object",
      },
      "4xx": {
        additionalProperties: false,
        properties: {
          status: {
            type: "number",
          },
        },
        type: "object",
      },
    };
    const genertatedInterface = `\
export interface Reply2XX {
  guid?: string;
}

export interface Reply4XX {
  status?: number;
}

export type Reply = Reply2XX | Reply4XX\
`;

    expect(await generateReplyInterfaces("", schema)).toEqual(
      genertatedInterface,
    );
  });
});

describe("#generateDefinitionInterfaces", () => {
  it("should generate the reply interface with an empty schema", async () => {
    expect(await generateDefinitionInterfaces()).toEqual(
      "export type Definitions = {}",
    );
    expect(await generateDefinitionInterfaces({})).toEqual(
      "export type Definitions = {}",
    );
  });

  it("should generate the reply interface with a single schema", async () => {
    const schema = {
      test: {
        additionalProperties: false,
        properties: {
          guid: {
            type: "string",
          },
        },
        type: "object",
      },
    };
    const genertatedInterface = `\
export interface Test {
  guid?: string;
}

export type Definitions = Test\
`;

    expect(await generateDefinitionInterfaces(schema)).toEqual(
      genertatedInterface,
    );
  });

  it("should generate the reply interface with a multiple schema", async () => {
    const schema = {
      test1: {
        additionalProperties: false,
        properties: {
          guid: {
            type: "string",
          },
        },
        type: "object",
      },
      test2: {
        additionalProperties: false,
        properties: {
          status: {
            type: "number",
          },
        },
        type: "object",
      },
    };
    const genertatedInterface = `\
export interface Test1 {
  guid?: string;
}

export interface Test2 {
  status?: number;
}

export type Definitions = Test1 | Test2\
`;

    expect(await generateDefinitionInterfaces(schema)).toEqual(
      genertatedInterface,
    );
  });
});

describe("#generateInterfaces", () => {
  it("should handle empty schema", async () => {
    expect(await generateInterfaces({}, defaultOptions)).toMatchSnapshot();
  });

  it("should not generate interfaces from unkown keys", async () => {
    expect(
      await generateInterfaces(
        {
          unkown: {
            properties: {
              test: {
                type: "string",
              },
            },
            type: "object",
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should handle incorrect json schema", async () => {
    expect(
      await generateInterfaces(
        {
          incorect: true,
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should generate query interface", async () => {
    expect(
      await generateInterfaces(
        {
          query: {
            type: "object",
            properties: {
              test: {
                type: "boolean",
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();

    expect(
      await generateInterfaces(
        {
          querystring: {
            type: "object",
            properties: {
              test: {
                type: "boolean",
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should generate params interface", async () => {
    expect(
      await generateInterfaces(
        {
          params: {
            type: "object",
            properties: {
              test: {
                type: "boolean",
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should generate body interface", async () => {
    expect(
      await generateInterfaces(
        {
          body: {
            type: "object",
            properties: {
              test: {
                type: "boolean",
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should generate headers interface", async () => {
    expect(
      await generateInterfaces(
        {
          headers: {
            type: "object",
            properties: {
              test: {
                type: "boolean",
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should generate reply interface", async () => {
    expect(
      await generateInterfaces(
        {
          response: {
            200: {
              type: "object",
              properties: {
                test: {
                  type: "boolean",
                },
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });

  it("should generate and use definitions interface", async () => {
    expect(
      await generateInterfaces(
        {
          body: {
            type: "object",
            properties: {
              $ref: "#/definitions/payload/properties",
            },
          },
          headers: {
            type: "object",
            properties: {
              $ref: "#/definitions/payload/properties",
            },
          },
          params: {
            type: "object",
            properties: {
              $ref: "#/definitions/payload/properties",
            },
          },
          query: {
            type: "object",
            properties: {
              $ref: "#/definitions/payload/properties",
            },
          },
          response: {
            200: {
              type: "object",
              properties: {
                $ref: "#/definitions/payload/properties",
              },
            },
          },
          definitions: {
            payload: {
              properties: {
                test: {
                  type: "boolean",
                },
              },
            },
          },
        },
        defaultOptions,
      ),
    ).toMatchSnapshot();
  });
});

describe("#addDefaultValueToSchema", () => {
  it("should add default values to schema", () => {
    const res = addDefaultValueToSchema({
      properties: {
        success: {
          type: "string",
        },
        message: {
          type: "string",
        },
      },
    });

    expect(res).toEqual({
      properties: {
        success: {
          type: "string",
        },
        message: {
          type: "string",
        },
      },
      additionalProperties: false,
    });
  });

  it("should add default values to nested schema", () => {
    const res = addDefaultValueToSchema({
      properties: {
        success: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
            },
          },
        },
        message: {
          type: "string",
        },
      },
    });

    expect(res).toEqual({
      properties: {
        success: {
          type: "object",
          additionalProperties: false,
          properties: {
            ok: {
              type: "boolean",
            },
          },
        },
        message: {
          type: "string",
        },
      },
      additionalProperties: false,
    });
  });

  it("should not overide values if already present", () => {
    const res = addDefaultValueToSchema({
      properties: {
        success: {
          type: "object",
          additionalProperties: true,
          properties: {
            ok: {
              type: "boolean",
            },
          },
        },
        message: {
          type: "string",
        },
      },
      additionalProperties: true,
    });

    expect(res).toEqual({
      properties: {
        success: {
          type: "object",
          additionalProperties: true,
          properties: {
            ok: {
              type: "boolean",
            },
          },
        },
        message: {
          type: "string",
        },
      },
      additionalProperties: true,
    });
  });

  it("should allow both objects and lists", () => {
    const res = addDefaultValueToSchema({
      properties: {
        success: {
          type: "object",
          required: ["ok"],
          properties: {
            ok: {
              type: "boolean",
            },
          },
        },
        message: {
          type: "string",
        },
      },
    });

    expect(res).toEqual({
      properties: {
        success: {
          type: "object",
          required: ["ok"],
          additionalProperties: false,
          properties: {
            ok: {
              type: "boolean",
            },
          },
        },
        message: {
          type: "string",
        },
      },
      additionalProperties: false,
    });
  });
});
