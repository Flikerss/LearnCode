import express from "express";
import usersController from "../controllers/userController.mjs";
import authenticateToken, { requireRole } from "../middlewares/authMiddleware.mjs";

const router = express.Router();

router.post("/", usersController.register);
router.post("/login", usersController.login);
router.post("/logout", usersController.logout);
router.get("/profile", authenticateToken, usersController.profile);
router.get("/", authenticateToken, usersController.getAll);
router.put(
  "/:id/progress/:lessonId",
  authenticateToken,
  usersController.updateProgress
);
router.put("/:id", authenticateToken, usersController.updateName);

router.get("/settings", authenticateToken, usersController.getSettings);
router.put("/settings", authenticateToken, usersController.updateSettings);
router.put("/avatar", authenticateToken, usersController.updateAvatar);
router.put("/password", authenticateToken, usersController.updatePassword);
router.get("/preferences", authenticateToken, usersController.getPreferences);
router.put("/preferences", authenticateToken, usersController.updatePreferences);
router.get("/progress", authenticateToken, usersController.getProgress);
router.put("/progress", authenticateToken, usersController.updateProgress);
router.get("/achievements", authenticateToken, usersController.getAchievements);

// Endpoint для изменения роли (только для админов)
router.put("/role", authenticateToken, requireRole("admin"), usersController.updateRole);

// Endpoint для создания первого админа (доступен всем, но только если нет админов)
router.post("/make-admin", usersController.makeFirstAdmin);

export default router;
