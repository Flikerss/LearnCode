import express from "express";
import feedbackControllerFactory from "../controllers/feedbackController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";

export default function (client) {
  const router = express.Router();
  const auth = createAuth(client);
  const feedbackController = feedbackControllerFactory(client);

  router.post("/", auth.optionalAuthenticateToken, asyncHandler(feedbackController.createFeedback));
  router.get("/", auth.optionalAuthenticateToken, asyncHandler(feedbackController.getFeedback));

  return router;
}


