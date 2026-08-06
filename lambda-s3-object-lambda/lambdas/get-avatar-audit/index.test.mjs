import assert from "node:assert/strict";

import { handleGetAvatarAudit } from "./index.mjs";

const missingKey = await handleGetAvatarAudit({ pathParameters: {} });
assert.equal(missingKey.statusCode, 400);

const notFound = await handleGetAvatarAudit(
  { pathParameters: { avatarKey: "avatars/ghost.png" } },
  { fetchItem: async () => null },
);
assert.equal(notFound.statusCode, 404);

const found = await handleGetAvatarAudit(
  { pathParameters: { avatarKey: "avatars/user-123.png" } },
  { fetchItem: async (key) => ({ avatarKey: key, userId: "user-123", sha256: "abc" }) },
);
assert.equal(found.statusCode, 200);
assert.deepEqual(JSON.parse(found.body), {
  avatarKey: "avatars/user-123.png",
  userId: "user-123",
  sha256: "abc",
});

console.log("ok");
