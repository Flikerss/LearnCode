import jwt from "jsonwebtoken";
import { client } from "../../app.mjs";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";

export default function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies?.token;
  const token = cookieToken || headerToken;

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        try {
          const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
          const session = await client
            .db("main")
            .collection("sessions")
            .findOne({
              userId: new ObjectId(decoded.userId),
              refreshToken: refreshToken,
            });

          if (session && session.expiresAt > new Date()) {
            const newToken = jwt.sign(
              { userId: decoded.userId, email: decoded.email },
              JWT_SECRET,
              { expiresIn: "7d" }
            );
            req.user = { userId: decoded.userId, email: decoded.email };
            res.cookie("token", newToken, {
              httpOnly: true,
              sameSite: "strict",
              secure: process.env.NODE_ENV === "production",
              maxAge: 7 * 24 * 60 * 60 * 1000,
              path: "/",
            });
            return next();
          }
        } catch (refreshErr) {
        }
      }
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader && authHeader.split(" ")[1];
  const cookieToken = req.cookies?.token;
  const token = cookieToken || headerToken;

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

export function requireRole(...roles) {
  return async (req, res, next) => {
    if (!req.user || !req.user.userId) {
      return res.sendStatus(401);
    }

    try {
      const user = await client
        .db("main")
        .collection("user")
        .findOne(
          { _id: new ObjectId(req.user.userId) },
          { projection: { role: 1 } }
        );

      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: "Недостаточно прав" });
      }

      req.user.role = user.role;
      next();
    } catch (error) {
      console.error("Ошибка проверки роли:", error);
      return res.sendStatus(500);
    }
  };
}