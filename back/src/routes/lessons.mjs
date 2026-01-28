import express from "express";
import lessonsControllerFactory from "../controllers/lessonsController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { validateObjectIdParams } from "../utils/validate.mjs";

export default function (client, JUDGE0_URL, JUDGE0_API_KEY) {
  const router = express.Router();
  const auth = createAuth(client);
  const lessonsController = lessonsControllerFactory(client, JUDGE0_URL, JUDGE0_API_KEY);
  const validateId = validateObjectIdParams(["id", "lessonId"]);

  router.get("/", auth.optionalAuthenticateToken, asyncHandler(lessonsController.getAllLessons));
  router.get("/:id", auth.optionalAuthenticateToken, validateId, asyncHandler(lessonsController.getLesson));
  router.get("/:lessonId/content", auth.optionalAuthenticateToken, validateId, asyncHandler(lessonsController.getLessonContent));

  router.post("/", auth.authenticateToken, asyncHandler(lessonsController.createLesson));
  router.put("/:id", auth.authenticateToken, validateId, asyncHandler(lessonsController.updateLesson));
  router.delete("/:id", auth.authenticateToken, validateId, asyncHandler(lessonsController.deleteLesson));
  router.post("/:lessonId/submit", auth.authenticateToken, validateId, asyncHandler(lessonsController.submitLesson));
  router.post("/:lessonId/completion", auth.authenticateToken, validateId, asyncHandler(lessonsController.markLessonCompleted));

  return router;
}
