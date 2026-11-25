import { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { api } from "./lib/api";
import "./App.css";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="site">
      <header className="header">
        <Link to="/" className="logo">
          hack<span>match</span>
          <b>✳</b>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/">Explore</NavLink>
          <NavLink to="/team">Find people</NavLink>
          <NavLink to="/chat">Community</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-chip">@{user.username}</span>
              <button onClick={logout} className="text-button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-button">
                Log in
              </Link>
              <Link to="/signup" className="small-button">
                Join now ↗
              </Link>
            </>
          )}
        </div>
      </header>
      {children}
      <footer className="footer">
        <span>HACKMATCH © {new Date().getFullYear()}</span>
        <span>FIND PEOPLE. BUILD SOMETHING.</span>
        <a href="mailto:tanay.gupta13865@gmail.com">CONTACT ↗</a>
      </footer>
    </div>
  );
}

function Notice({ children, kind = "info" }) {
  return (
    <p
      className={`notice ${kind}`}
      role={kind === "error" ? "alert" : undefined}
    >
      {children}
    </p>
  );
}

function Home() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    link: "",
  });
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      setItems(await api("/hackathons"));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/hackathons", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", description: "", date: "", location: "", link: "" });
      setCreating(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <i /> YOUR NEXT TEAM STARTS HERE
          </span>
          <h1>
            Find your people.
            <br />
            <em>Build the next thing.</em>
          </h1>
          <p>
            Discover hackathons, meet talented builders, and turn the idea in
            your head into something real.
          </p>
          <div className="hero-buttons">
            <Link to="/team" className="button primary">
              Find teammates <span>↗</span>
            </Link>
            <a href="#hackathons" className="button outline">
              Explore hackathons <span>↓</span>
            </a>
          </div>
          <div className="hero-proof">
            <span>01 / DISCOVER</span>
            <span>02 / CONNECT</span>
            <span>03 / BUILD</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-grid" />
          <div className="art-card card-a">
            <span>FRONTEND</span>
            <strong>
              Creative
              <br />
              builder
            </strong>
            <b>↗</b>
          </div>
          <div className="art-card card-b">
            <span>BACKEND</span>
            <strong>
              Systems
              <br />
              thinker
            </strong>
            <b>↗</b>
          </div>
          <div className="art-card card-c">
            <span>DESIGN</span>
            <strong>
              Pixel
              <br />
              person
            </strong>
            <b>↗</b>
          </div>
          <div className="art-center">✳</div>
          <span className="art-caption">GOOD IDEAS GET BETTER TOGETHER</span>
        </div>
      </section>
      <div className="marquee">
        BUILD WITH PEOPLE WHO GET IT ✳ BUILD WITH PEOPLE WHO GET IT ✳ BUILD
        WITH PEOPLE WHO GET IT ✳
      </div>
      <section className="section" id="hackathons">
        <div className="section-head">
          <div>
            <span className="eyebrow">01 / THE OPPORTUNITIES</span>
            <h2>
              Find a reason
              <br />
              <em>to make something.</em>
            </h2>
          </div>
          <p>
            Upcoming hackathons from the community. Pick one and bring your team
            together.
          </p>
        </div>
        <div className="section-actions">
          <span>{items.length} UPCOMING HACKATHONS</span>
          {user ? (
            <button
              className="text-button"
              onClick={() => setCreating(!creating)}
            >
              {creating ? "Cancel" : "+ Add a hackathon"}
            </button>
          ) : (
            <Link className="text-button" to="/signup">
              Join to add an event ↗
            </Link>
          )}
        </div>
        {creating && (
          <form className="form-panel" onSubmit={submit}>
            <div className="form-grid">
              <label>
                Hackathon name
                <input
                  required
                  maxLength="100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Date
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </label>
              <label>
                Location or remote
                <input
                  required
                  maxLength="100"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </label>
              <label>
                Official link
                <input
                  required
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
              </label>
            </div>
            <label>
              Description
              <textarea
                required
                maxLength="500"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <button className="button primary" disabled={busy}>
              Publish event ↗
            </button>
          </form>
        )}
        {error && <Notice kind="error">{error}</Notice>}
        <div className="event-grid">
          {items.length ? (
            items.map((item, i) => (
              <article className="event-card" key={item._id}>
                <div className="event-top">
                  <span>0{i + 1} / HACKATHON</span>
                  <span>
                    {new Date(item.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="event-bottom">
                  <span>⌖ {item.location}</span>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Visit event ↗
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <span>✳</span>
              <h3>New opportunities start here.</h3>
              <p>
                No upcoming events have been posted yet.{" "}
                {user
                  ? "Add one to get the community moving."
                  : "Join the community to post the first."}
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="wide-cta">
        <span>DON&apos;T BUILD ALONE</span>
        <h2>
          Find the teammate
          <br />
          you didn&apos;t know you needed.
        </h2>
        <Link to="/team" className="button light">
          Meet the builders <span>↗</span>
        </Link>
      </section>
    </main>
  );
}

function Team() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    tags: "",
    linkedInUrl: "",
  });
  async function load() {
    try {
      setProfiles(await api("/profiles"));
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function edit() {
    try {
      const profile = await api("/profile/me");
      if (profile)
        setForm({
          name: profile.name || "",
          bio: profile.bio || "",
          tags: (profile.tags || []).join(", "),
          linkedInUrl: profile.linkedInUrl || "",
        });
      setEditing(true);
    } catch (e) {
      setError(e.message);
    }
  }
  async function save(event) {
    event.preventDefault();
    try {
      await api("/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      setEditing(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }
  const visible = profiles.filter((p) =>
    `${p.name} ${p.bio} ${(p.tags || []).join(" ")}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <main className="section page">
      <div className="section-head">
        <div>
          <span className="eyebrow">02 / THE PEOPLE</span>
          <h1>
            Find your
            <br />
            <em>kind of builder.</em>
          </h1>
        </div>
        <p>
          Skills are useful. Good collaborators are everything. Find someone who
          complements your next project.
        </p>
      </div>
      <div className="section-actions">
        <input
          className="search"
          aria-label="Search people and skills"
          placeholder="Search people or skills..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {user ? (
          <button className="text-button" onClick={edit}>
            Edit my profile ↗
          </button>
        ) : (
          <Link className="text-button" to="/signup">
            Create a profile ↗
          </Link>
        )}
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      {editing && (
        <form className="form-panel" onSubmit={save}>
          <div className="form-grid">
            <label>
              Your name
              <input
                required
                maxLength="60"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Skills, separated by commas
              <input
                maxLength="360"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </label>
            <label>
              LinkedIn profile URL
              <input
                type="url"
                value={form.linkedInUrl}
                onChange={(e) =>
                  setForm({ ...form, linkedInUrl: e.target.value })
                }
              />
            </label>
          </div>
          <label>
            Short bio
            <textarea
              maxLength="280"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </label>
          <button className="button primary">Save profile ↗</button>
        </form>
      )}
      <div className="people-grid">
        {visible.length ? (
          visible.map((person, i) => (
            <article className="person-card" key={person._id}>
              <div className="person-top">
                <span className="avatar">
                  {person.name?.slice(0, 1).toUpperCase()}
                </span>
                <span>BUILDER / {String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3>{person.name}</h3>
              <p>{person.bio || "Ready to meet fellow builders."}</p>
              <div className="tag-list">
                {(person.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {person.linkedInUrl && (
                <a
                  href={person.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link"
                >
                  Connect on LinkedIn ↗
                </a>
              )}
            </article>
          ))
        ) : (
          <div className="empty-state">
            <span>✳</span>
            <h3>No matches yet.</h3>
            <p>
              Try a broader search, or add your profile to help others find you.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api("/messages");
        if (active) {
          setMessages(data);
          setError("");
        }
      } catch (e) {
        if (active) setError(e.message);
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  async function send(event) {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      const message = await api("/messages", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setMessages((current) => [...current, message]);
      setText("");
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <main className="section page chat-page">
      <div className="section-head">
        <div>
          <span className="eyebrow">03 / THE COMMUNITY</span>
          <h1>
            Ideas move
            <br />
            <em>faster together.</em>
          </h1>
        </div>
        <p>
          Share an idea, ask for a teammate, or just say hello. The conversation
          is open to everyone.
        </p>
      </div>
      <div className="chat-box">
        <div className="chat-title">
          <span>
            <i /> COMMUNITY ROOM
          </span>
          <span>{messages.length} RECENT MESSAGES</span>
        </div>
        <div className="chat-feed" aria-live="polite">
          {messages.length ? (
            messages.map((m) => (
              <div className="chat-message" key={m._id}>
                <span className="chat-avatar">
                  {m.username.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <div>
                    <strong>@{m.username}</strong>
                    <time>
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p>{m.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="chat-empty">
              Be the first to start a conversation. ✳
            </div>
          )}
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        {user ? (
          <form className="chat-compose" onSubmit={send}>
            <input
              aria-label="Your message"
              maxLength="500"
              placeholder="Say something useful..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" disabled={!text.trim()}>
              Send ↗
            </button>
          </form>
        ) : (
          <div className="chat-compose locked">
            <span>Want to join the conversation?</span>
            <Link to="/signup">Create an account ↗</Link>
          </div>
        )}
      </div>
    </main>
  );
}

function Auth({ mode }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api(mode === "signup" ? "/signup" : "/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setUser(result.user);
      navigate(mode === "signup" ? "/team" : "/");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-art">
        <span>HACKMATCH / {mode === "signup" ? "JOIN" : "WELCOME BACK"}</span>
        <div>✳</div>
        <p>Build with people who get it.</p>
      </div>
      <div className="auth-form-wrap">
        <span className="eyebrow">
          {mode === "signup" ? "JOIN THE COMMUNITY" : "WELCOME BACK"}
        </span>
        <h1>
          {mode === "signup" ? "Let’s get building." : "Good to see you."}
        </h1>
        <p>
          {mode === "signup"
            ? "Create an account, add your skills, and find your next team."
            : "Your next collaboration is waiting."}
        </p>
        <form onSubmit={submit}>
          <label>
            Username
            <input
              required
              autoComplete="username"
              minLength="3"
              maxLength="24"
              pattern="[A-Za-z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && <Notice kind="error">{error}</Notice>}
          <button disabled={busy} className="button primary">
            {busy
              ? "One moment..."
              : mode === "signup"
                ? "Create account ↗"
                : "Log in ↗"}
          </button>
        </form>
        <p className="auth-switch">
          {mode === "signup" ? "Already a member?" : "New here?"}{" "}
          <Link to={mode === "signup" ? "/login" : "/signup"}>
            {mode === "signup" ? "Log in" : "Join now"}
          </Link>
        </p>
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="section page simple-page">
      <span className="eyebrow">04 / WHY HACKMATCH</span>
      <h1>
        Good things happen
        <br />
        <em>when builders meet.</em>
      </h1>
      <p>
        HackMatch is a place to discover hackathons and meet collaborators with
        complementary skills. Add your profile, find an event, and start a
        conversation. The rest is yours to build.
      </p>
      <Link to="/team" className="button primary">
        Find your people ↗
      </Link>
    </main>
  );
}
function Contact() {
  return (
    <main className="section page simple-page">
      <span className="eyebrow">05 / SAY HELLO</span>
      <h1>
        Got a question
        <br />
        <em>or an idea?</em>
      </h1>
      <p>We&apos;d love to hear it.</p>
      <a className="contact-link" href="mailto:tanay.gupta13865@gmail.com">
        tanay.gupta13865@gmail.com ↗
      </a>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    let active = true;
    api("/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  async function logout() {
    await api("/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/team" element={<Team />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
