import express from "express";
import walletControllerFactory from "../controllers/walletController.mjs";
import authenticateToken from "../middlewares/authMiddleware.mjs";

export default function (client) {
  const router = express.Router();
  const walletController = walletControllerFactory(client);

  router.get("/", authenticateToken, walletController.getWallet);
  router.get("/transactions", authenticateToken, walletController.getTransactions);
  router.post("/earn", authenticateToken, walletController.earnCurrency);

  return router;
}


