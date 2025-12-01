import express from "express";
import feedbackControllerFactory from "../controllers/feedbackController.mjs";
import { optionalAuthenticateToken } from "../middlewares/authMiddleware.mjs";

export default function (client) {
  const router = express.Router();
  const feedbackController = feedbackControllerFactory(client);

  router.post("/", optionalAuthenticateToken, feedbackController.createFeedback);
  router.get("/", optionalAuthenticateToken, feedbackController.getFeedback);

  return router;
}


