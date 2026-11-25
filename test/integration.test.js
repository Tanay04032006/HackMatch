import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

test("signup, profile, event, chat, and login work against MongoDB", async () => {
  const database = await MongoMemoryServer.create();
  process.env.MONGODB_URI = database.getUri("hackmatch_test");
  process.env.JWT_SECRET = "test-only-secret-longer-than-thirty-two-characters";
  const { default: handler } = await import("../api/index.js");
  const server = createServer(handler).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, { method = "GET", body, cookie } = {}) {
    const response = await fetch(`${base}/api/index?path=${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { response, body: await response.json() };
  }
  try {
    assert.deepEqual((await request("health")).body, { status: "ready" });
    const signup = await request("signup", {
      method: "POST",
      body: { username: "Builder_1", password: "a-secure-password" },
    });
    assert.equal(signup.response.status, 201);
    assert.equal(signup.body.user.username, "builder_1");
    assert.equal(
      (
        await request("signup", {
          method: "POST",
          body: { username: "builder_1", password: "another-password" },
        })
      ).response.status,
      409,
    );
    const cookie = signup.response.headers.get("set-cookie").split(";")[0];
    const stored = await mongoose.connection.db
      .collection("users")
      .findOne({ username: "builder_1" });
    assert.notEqual(stored.passwordHash, "a-secure-password");
    assert.equal(stored.password, undefined);
    const profile = await request("profile/me", {
      method: "PUT",
      cookie,
      body: {
        name: "Builder One",
        bio: "Full-stack developer",
        tags: ["React", "Node.js"],
        linkedInUrl: "https://www.linkedin.com/in/example/",
      },
    });
    assert.equal(profile.response.status, 200);
    assert.equal(profile.body.name, "Builder One");
    const people = await request("profiles");
    assert.equal(people.body[0].name, "Builder One");
    const event = await request("hackathons", {
      method: "POST",
      cookie,
      body: {
        name: "Build Day",
        description: "Make a useful prototype.",
        date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Remote",
        link: "https://example.com",
      },
    });
    assert.equal(event.response.status, 201);
    assert.equal((await request("hackathons")).body[0].name, "Build Day");
    const message = await request("messages", {
      method: "POST",
      cookie,
      body: { text: "Looking for a teammate!" },
    });
    assert.equal(message.response.status, 201);
    assert.equal(
      (await request("messages")).body[0].text,
      "Looking for a teammate!",
    );
    assert.equal(
      (
        await request("messages", {
          method: "POST",
          body: { text: "Not signed in" },
        })
      ).response.status,
      401,
    );
    assert.equal(
      (
        await request("login", {
          method: "POST",
          body: { username: "builder_1", password: "wrong-password" },
        })
      ).response.status,
      401,
    );
    const login = await request("login", {
      method: "POST",
      body: { username: "builder_1", password: "a-secure-password" },
    });
    assert.equal(login.response.status, 200);
    assert.equal(login.body.user.username, "builder_1");
  } finally {
    server.close();
    await mongoose.disconnect();
    await database.stop();
  }
});
