import express from "express";
import achievementsControllerFactory from "../controllers/achievementsController.mjs";
import { optionalAuthenticateToken } from "../middlewares/authMiddleware.mjs";

export default function (client) {
  const router = express.Router();
  const achievementsController = achievementsControllerFactory(client);

  router.get("/", optionalAuthenticateToken, achievementsController.getAllAchievements);
  router.get("/:id", optionalAuthenticateToken, achievementsController.getAchievementById);

  return router;
}


