import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies?.token;
  const token = cookieToken || headerToken;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
