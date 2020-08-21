import { generateReplyInterfaces } from ".";

describe("#generateReplyInterfaces", () => {
  it("should generate the reply interface with an empty schema", async () => {
    expect(await generateReplyInterfaces("")).toEqual("type Reply = {}");
    expect(await generateReplyInterfaces("XXX")).toEqual("type XXXReply = {}");
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

type Reply = Reply2XX\
`;

    expect(await generateReplyInterfaces("", schema)).toEqual(
      genertatedInterface
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

type Reply = Reply2XX | Reply4XX\
`;

    expect(await generateReplyInterfaces("", schema)).toEqual(
      genertatedInterface
    );
  });
});
