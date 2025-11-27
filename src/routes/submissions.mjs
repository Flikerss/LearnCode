import express from "express";
import submissionsControllerFactory from "../controllers/submissionsController.mjs";
import authenticateToken from "../middlewares/authMiddleware.mjs";

export default function (client, JUDGE0_URL, JUDGE0_API_KEY) {
  const router = express.Router();
  const submissionsController = submissionsControllerFactory(client, JUDGE0_URL, JUDGE0_API_KEY);

  router.post("/", authenticateToken, submissionsController.createSubmission);
  router.get("/", authenticateToken, submissionsController.getSubmissions);

  return router;
}


