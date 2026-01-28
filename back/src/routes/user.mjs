import express from "express";
import userControllerFactory from "../controllers/userController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { validateObjectIdParams } from "../utils/validate.mjs";

export default function userRoutesFactory(client) {
  const router = express.Router();
  const auth = createAuth(client);
  const usersController = userControllerFactory(client);
  const validateId = validateObjectIdParams(["id", "lessonId"]);

  router.post("/", asyncHandler(usersController.register));
  router.post("/login", asyncHandler(usersController.login));
  router.post("/logout", usersController.logout);
  router.get("/profile", auth.authenticateToken, asyncHandler(usersController.profile));
  router.get("/", auth.authenticateToken, asyncHandler(usersController.getAll));
  router.put(
    "/:id/progress/:lessonId",
    auth.authenticateToken,
    validateId,
    asyncHandler(usersController.updateProgress)
  );
  router.put("/:id", auth.authenticateToken, validateId, asyncHandler(usersController.updateName));

  router.get("/settings", auth.authenticateToken, asyncHandler(usersController.getSettings));
  router.put("/settings", auth.authenticateToken, asyncHandler(usersController.updateSettings));
  router.put("/avatar", auth.authenticateToken, asyncHandler(usersController.updateAvatar));
  router.put("/password", auth.authenticateToken, asyncHandler(usersController.updatePassword));
  router.get("/preferences", auth.authenticateToken, asyncHandler(usersController.getPreferences));
  router.put("/preferences", auth.authenticateToken, asyncHandler(usersController.updatePreferences));
  router.get("/progress", auth.authenticateToken, asyncHandler(usersController.getProgress));
  router.put("/progress", auth.authenticateToken, asyncHandler(usersController.updateProgress));
  router.get("/achievements", auth.authenticateToken, asyncHandler(usersController.getAchievements));

  return router;
}
