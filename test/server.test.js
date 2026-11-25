import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

delete process.env.MONGODB_URI;
delete process.env.JWT_SECRET;
const { default: handler } = await import("../api/index.js");

test("health reports when the database is not configured", async () => {
  const server = createServer(handler).listen(0);
  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/index?path=health`,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "setup_required" });
  } finally {
    server.close();
  }
});

test("account creation fails safely without server secrets", async () => {
  const server = createServer(handler).listen(0);
  try {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/index?path=signup`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "tester",
          password: "securepassword",
        }),
      },
    );
    assert.equal(response.status, 503);
    assert.equal(
      (await response.json()).error,
      "Service is temporarily unavailable.",
    );
  } finally {
    server.close();
  }
});
