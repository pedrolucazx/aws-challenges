import assert from "node:assert/strict";

import { isAllowedContentType, parseAvatarKey, processAvatarRecord } from "./index.mjs";

assert.deepEqual(parseAvatarKey("avatars/user-123.png"), { userId: "user-123" });
assert.equal(parseAvatarKey("avatars/user-123/extra.png"), null);
assert.equal(parseAvatarKey("other/user-123.png"), null);

assert.equal(isAllowedContentType("image/png"), true);
assert.equal(isAllowedContentType("application/pdf"), false);

const record = {
  s3: { bucket: { name: "aws-challenges-imm-avatars-000000000000" }, object: { key: "avatars/user-123.png" } },
};

let putItemCall;
const okResult = await processAvatarRecord(record, {
  fetchObject: async () => ({ body: Buffer.from("fake image bytes"), contentType: "image/png" }),
  putItem: async (item) => {
    putItemCall = item;
  },
});

assert.equal(okResult.skipped, false);
assert.equal(putItemCall.avatarKey, "avatars/user-123.png");
assert.equal(putItemCall.userId, "user-123");
assert.equal(putItemCall.contentType, "image/png");
assert.equal(putItemCall.sizeBytes, Buffer.from("fake image bytes").length);
assert.equal(putItemCall.sha256.length, 64);

const skippedBadType = await processAvatarRecord(record, {
  fetchObject: async () => ({ body: Buffer.from("x"), contentType: "application/pdf" }),
  putItem: async () => {
    throw new Error("should not be called");
  },
});
assert.equal(skippedBadType.skipped, true);

const skippedBadKey = await processAvatarRecord(
  {
    s3: {
      bucket: { name: "b" },
      object: { key: "other/file.png" },
    },
  },
  {
    fetchObject: async () => {
      throw new Error("should not be called");
    },
    putItem: async () => {
      throw new Error("should not be called");
    },
  },
);
assert.equal(skippedBadKey.skipped, true);

console.log("ok");
