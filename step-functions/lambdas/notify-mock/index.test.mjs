import assert from "node:assert/strict";

import { handler } from "./index.mjs";

const result = await handler({
  dueReminders: [{ fakeUserId: "demo-user-1", habitName: "Drink water" }],
});
assert.equal(result.notified, 1);
assert.deepEqual(result.log, ["would notify demo-user-1 about Drink water"]);

const empty = await handler({ dueReminders: [] });
assert.deepEqual(empty, { notified: 0, log: [] });

const missingField = await handler();
assert.deepEqual(missingField, { notified: 0, log: [] });

console.log("ok");
