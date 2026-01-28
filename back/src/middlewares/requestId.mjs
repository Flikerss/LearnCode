import { randomBytes } from "crypto";

export default function requestId(req, res, next) {
  req.id = req.headers["x-request-id"] || randomBytes(8).toString("hex");
  res.setHeader("X-Request-Id", req.id);
  next();
}
