import express from "express";
import achievementsControllerFactory from "../controllers/achievementsController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { validateObjectIdParams } from "../utils/validate.mjs";

export default function (client) {
  const router = express.Router();
  const auth = createAuth(client);
  const achievementsController = achievementsControllerFactory(client);

  router.get("/", auth.optionalAuthenticateToken, asyncHandler(achievementsController.getAllAchievements));
  router.get("/:id", auth.optionalAuthenticateToken, validateObjectIdParams(["id"]), asyncHandler(achievementsController.getAchievementById));

  return router;
}


