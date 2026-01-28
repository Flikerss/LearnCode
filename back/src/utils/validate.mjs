import { ObjectId } from "mongodb";
import AppError from "../errors/AppError.mjs";

const HEX_24 = /^[a-fA-F0-9]{24}$/;

export function isValidObjectId(id) {
  return typeof id === "string" && HEX_24.test(id);
}

export function validateObjectIdParams(paramNames) {
  return (req, res, next) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value != null && !isValidObjectId(value)) {
        return next(
          AppError.badRequest(`Некорректный идентификатор в параметре: ${name}`, "INVALID_ID")
        );
      }
    }
    next();
  };
}
