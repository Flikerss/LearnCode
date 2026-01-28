import express from "express";
import contentControllerFactory from "../controllers/contentController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";

export default function (client) {
  const router = express.Router();
  const auth = createAuth(client);
  const contentController = contentControllerFactory(client);

  router.get("/:type", auth.optionalAuthenticateToken, asyncHandler(contentController.getContent));
  router.put("/:type", auth.authenticateToken, asyncHandler(contentController.updateContent));

  return router;
}


