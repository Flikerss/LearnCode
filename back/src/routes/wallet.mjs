import express from "express";
import walletControllerFactory from "../controllers/walletController.mjs";
import createAuth from "../middlewares/authMiddleware.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";

export default function (client) {
  const router = express.Router();
  const auth = createAuth(client);
  const walletController = walletControllerFactory(client);

  router.get("/", auth.authenticateToken, asyncHandler(walletController.getWallet));
  router.get("/transactions", auth.authenticateToken, asyncHandler(walletController.getTransactions));
  router.post("/earn", auth.authenticateToken, asyncHandler(walletController.earnCurrency));

  return router;
}


