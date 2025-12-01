import express from "express";
import contentControllerFactory from "../controllers/contentController.mjs";
import authenticateToken, { optionalAuthenticateToken } from "../middlewares/authMiddleware.mjs";

export default function (client) {
  const router = express.Router();
  const contentController = contentControllerFactory(client);

  router.get("/:type", optionalAuthenticateToken, contentController.getContent);
  router.put("/:type", authenticateToken, contentController.updateContent);

  return router;
}


