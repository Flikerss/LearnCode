import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { config } from "../config/index.mjs";
import AppError from "../errors/AppError.mjs";

const { jwt: jwtConfig } = config;

export default function createAuth(client) {
  const db = () => client.db(config.db.name);

  function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];
    const cookieToken = req.cookies?.token;
    const token = cookieToken || headerToken;

    if (!token) {
      return next(AppError.unauthorized("Токен не предоставлен", "NO_TOKEN"));
    }

    jwt.verify(token, jwtConfig.secret, async (err, user) => {
      if (err) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
          try {
            const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
            const session = await db()
              .collection("sessions")
              .findOne({
                userId: new ObjectId(decoded.userId),
                refreshToken,
              });

            if (session && session.expiresAt > new Date()) {
              const newToken = jwt.sign(
                { userId: decoded.userId, email: decoded.email },
                jwtConfig.secret,
                { expiresIn: jwtConfig.accessExpires }
              );
              req.user = { userId: decoded.userId, email: decoded.email };
              res.cookie("token", newToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: config.env === "production",
                maxAge: config.security.cookieMaxAge,
                path: "/",
              });
              return next();
            }
          } catch {

          }
        }
        return next(AppError.forbidden("Доступ запрещен"));
      }
      req.user = user;
      next();
    });
  }

  function optionalAuthenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const headerToken = authHeader && authHeader.split(" ")[1];
    const cookieToken = req.cookies?.token;
    const token = cookieToken || headerToken;

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, jwtConfig.secret, (err, user) => {
      if (err) {
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  }

  async function requireRole(...roles) {
    return async (req, res, next) => {
      if (!req.user?.userId) {
        return next(AppError.unauthorized("Необходима авторизация"));
      }
      try {
        const user = await db()
          .collection("user")
          .findOne(
            { _id: new ObjectId(req.user.userId) },
            { projection: { role: 1 } }
          );
        if (!user || !roles.includes(user.role)) {
          return next(AppError.forbidden("Недостаточно прав"));
        }
        req.user.role = user.role;
        next();
      } catch (error) {
        console.error("Ошибка проверки роли:", error);
        next(error);
      }
    };
  }

  return {
    authenticateToken,
    optionalAuthenticateToken,
    requireRole,
  };
}
