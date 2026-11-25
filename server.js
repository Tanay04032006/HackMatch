import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    password: { type: String, select: false }, // Legacy records only; removed on successful login.
  },
  { timestamps: true },
);
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    bio: { type: String, default: "" },
    tags: { type: [String], default: [] },
    linkedInUrl: { type: String, default: "" },
  },
  { timestamps: true },
);
const hackathonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    link: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
const messageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Profile =
  mongoose.models.Profile || mongoose.model("Profile", profileSchema);
const Hackathon =
  mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema);
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
let connectionPromise;

async function connect() {
  if (
    !process.env.MONGODB_URI ||
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  ) {
    throw new Error("Server configuration is incomplete");
  }
  if (mongoose.connection.readyState === 1) {
    await User.init();
    return;
  }
  if (!connectionPromise)
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  await connectionPromise;
  await User.init();
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
function checkPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function cookie(req) {
  return Object.fromEntries(
    (req.headers.cookie || "")
      .split(";")
      .map((part) => {
        const at = part.indexOf("=");
        return at < 0
          ? []
          : [part.slice(0, at).trim(), part.slice(at + 1).trim()];
      })
      .filter((pair) => pair.length === 2),
  );
}
function session(req) {
  try {
    return jwt.verify(cookie(req).hackmatch_session, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
function requireUser(req, res, next) {
  const identity = session(req);
  if (!identity?.id)
    return res.status(401).json({ error: "Please sign in first." });
  req.identity = identity;
  next();
}
function setSession(res, user) {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("hackmatch_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}
function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function validUrl(value) {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
function validLinkedIn(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "linkedin.com" ||
        url.hostname.endsWith(".linkedin.com"))
    );
  } catch {
    return false;
  }
}

app.get("/api/health", async (_req, res) => {
  if (
    !process.env.MONGODB_URI ||
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32
  )
    return res.json({ status: "setup_required" });
  try {
    await connect();
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});
app.use("/api", async (_req, res, next) => {
  try {
    await connect();
    next();
  } catch (error) {
    console.error("Database unavailable:", error.message);
    res.status(503).json({ error: "Service is temporarily unavailable." });
  }
});

app.post("/api/signup", async (req, res) => {
  const username = clean(req.body.username, 24).toLowerCase();
  const password = req.body.password;
  if (
    !/^[a-z0-9_]{3,24}$/.test(username) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).json({
      error:
        "Use a 3–24 character username and a password of at least 8 characters.",
    });
  }
  try {
    const user = await User.create({
      username,
      passwordHash: hashPassword(password),
    });
    await Profile.create({ user: user.id, name: username });
    setSession(res, user);
    res.status(201).json({ user: { id: user.id, username } });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ error: "That username is taken." });
    res.status(500).json({ error: "Could not create your account." });
  }
});

app.post("/api/login", async (req, res) => {
  const username = clean(req.body.username, 24).toLowerCase();
  const password = req.body.password;
  if (!username || typeof password !== "string")
    return res.status(400).json({ error: "Enter your username and password." });
  const user = await User.findOne({ username }).select("+password");
  const legacyMatch =
    user?.password &&
    Buffer.byteLength(password) === Buffer.byteLength(user.password) &&
    timingSafeEqual(Buffer.from(password), Buffer.from(user.password));
  if (!user || !(checkPassword(password, user.passwordHash) || legacyMatch))
    return res.status(401).json({ error: "Invalid credentials." });
  if (legacyMatch) {
    user.passwordHash = hashPassword(password);
    user.password = undefined;
    await user.save();
  }
  setSession(res, user);
  res.json({ user: { id: user.id, username } });
});
app.post("/api/logout", (_req, res) => {
  res.clearCookie("hackmatch_session", { path: "/" });
  res.json({ ok: true });
});
app.get("/api/me", requireUser, (req, res) => res.json({ user: req.identity }));

app.get("/api/profiles", async (_req, res) => {
  const profiles = await Profile.find()
    .sort({ updatedAt: -1 })
    .limit(100)
    .select("name bio tags linkedInUrl updatedAt")
    .lean();
  res.json(profiles);
});
app.get("/api/profile/me", requireUser, async (req, res) => {
  const profile = await Profile.findOne({ user: req.identity.id }).lean();
  res.json(profile || null);
});
app.put("/api/profile/me", requireUser, async (req, res) => {
  const name = clean(req.body.name, 60);
  const bio = clean(req.body.bio, 280);
  const tags = Array.isArray(req.body.tags)
    ? [
        ...new Set(req.body.tags.map((tag) => clean(tag, 30)).filter(Boolean)),
      ].slice(0, 12)
    : [];
  const linkedInUrl = clean(req.body.linkedInUrl, 250);
  if (!name || (linkedInUrl && !validLinkedIn(linkedInUrl)))
    return res
      .status(400)
      .json({ error: "Enter a name and a valid LinkedIn link." });
  const profile = await Profile.findOneAndUpdate(
    { user: req.identity.id },
    { name, bio, tags, linkedInUrl },
    { new: true, upsert: true, runValidators: true },
  );
  res.json(profile);
});

app.get("/api/hackathons", async (_req, res) => {
  const hackathons = await Hackathon.find({ date: { $gte: new Date() } })
    .sort({ date: 1 })
    .limit(100)
    .lean();
  res.json(hackathons);
});
app.post("/api/hackathons", requireUser, async (req, res) => {
  const name = clean(req.body.name, 100);
  const description = clean(req.body.description, 500);
  const location = clean(req.body.location, 100);
  const link = clean(req.body.link, 300);
  const date = new Date(req.body.date);
  if (
    !name ||
    !description ||
    !location ||
    !validUrl(link) ||
    Number.isNaN(date.getTime()) ||
    date < new Date()
  ) {
    return res.status(400).json({
      error:
        "Enter a name, description, future date, location, and valid link.",
    });
  }
  const hackathon = await Hackathon.create({
    name,
    description,
    date,
    location,
    link,
    author: req.identity.id,
  });
  res.status(201).json(hackathon);
});

app.get("/api/messages", async (_req, res) => {
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json(messages.reverse());
});
app.post("/api/messages", requireUser, async (req, res) => {
  const text = clean(req.body.text, 500);
  if (!text) return res.status(400).json({ error: "Write a message first." });
  const message = await Message.create({
    author: req.identity.id,
    username: req.identity.username,
    text,
  });
  res.status(201).json(message);
});

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));
app.use((error, _req, res, _next) => {
  void _next;
  console.error("Request failed:", error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});
export default app;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  app.listen(Number(process.env.PORT || 5001), () =>
    console.log(`HackMatch API listening on ${process.env.PORT || 5001}`),
  );
}
