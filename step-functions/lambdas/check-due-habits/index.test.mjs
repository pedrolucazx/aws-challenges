import assert from "node:assert/strict";

import { handler, toDueReminders } from "./index.mjs";

assert.deepEqual(
  toDueReminders([{ reminderId: "r1", habitName: "Drink water", fakeUserId: "u1", dueToday: true }]),
  [{ reminderId: "r1", habitName: "Drink water", fakeUserId: "u1" }],
);
assert.deepEqual(toDueReminders([]), []);

const result = await handler(
  {},
  { scan: async () => [{ reminderId: "r1", habitName: "Drink water", fakeUserId: "u1" }] },
);
assert.deepEqual(result, {
  dueReminders: [{ reminderId: "r1", habitName: "Drink water", fakeUserId: "u1" }],
});

const empty = await handler({}, { scan: async () => [] });
assert.deepEqual(empty, { dueReminders: [] });

console.log("ok");
