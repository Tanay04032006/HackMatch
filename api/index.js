import app from "../server.js";

export default function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = url.searchParams.get("path");
  if (path && /^[a-z0-9/_-]+$/i.test(path)) req.url = `/api/${path}`;
  return app(req, res);
}
