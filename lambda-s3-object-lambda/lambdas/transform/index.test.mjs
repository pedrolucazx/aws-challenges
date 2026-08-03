import assert from "node:assert/strict";

import { handleObjectLambdaEvent, transformBody } from "./index.mjs";

const text = new TextEncoder().encode("hello s3\n");
assert.equal(new TextDecoder().decode(transformBody(text, "text/plain")), "HELLO S3\n");

const binary = new Uint8Array([0, 1, 2]);
assert.equal(transformBody(binary, "application/octet-stream"), binary);

let written;
const result = await handleObjectLambdaEvent(
  {
    getObjectContext: {
      inputS3Url: "https://example.invalid/source",
      outputRoute: "route",
      outputToken: "token",
    },
  },
  {
    fetchObject: async () => ({
      ok: true,
      headers: new Headers({ "content-type": "text/plain; charset=utf-8" }),
      arrayBuffer: async () => new TextEncoder().encode("mixed Case").buffer,
    }),
    writeResponse: async (params) => {
      written = params;
    },
  },
);

assert.deepEqual(result, { statusCode: 200 });
assert.equal(written.RequestRoute, "route");
assert.equal(written.RequestToken, "token");
assert.equal(written.ContentType, "text/plain; charset=utf-8");
assert.equal(new TextDecoder().decode(written.Body), "MIXED CASE");
