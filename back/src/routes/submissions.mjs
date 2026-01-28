import express from "express";
import submissionsControllerFactory from "../controllers/submissionsController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";

export default function (client, JUDGE0_URL, JUDGE0_API_KEY) {
  const router = express.Router();
  const auth = createAuth(client);
  const submissionsController = submissionsControllerFactory(client, JUDGE0_URL, JUDGE0_API_KEY);

  router.post("/", auth.authenticateToken, asyncHandler(submissionsController.createSubmission));
  router.get("/", auth.authenticateToken, asyncHandler(submissionsController.getSubmissions));

  return router;
}


