import { ObjectId } from "mongodb";
import AppError from "../errors/AppError.mjs";

export default (client) => {
  const getWallet = async (req, res) => {
    const { userId } = req.user || {};
    const wallets = await client
      .db("main")
      .collection("user_wallets")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const currencies = await client
      .db("main")
      .collection("currencies")
      .find({})
      .toArray();

    const balance = {};
    for (const wallet of wallets) {
        const currency = currencies.find(
          (c) => c._id.toString() === wallet.currencyId.toString()
        );
      if (currency) {
        balance[currency.type] = {
          amount: wallet.balance || 0,
          currencyId: currency._id.toString(),
          currencyName: currency.name,
        };
      }
    }

    res.status(200).json({ balance });
  };

  const getTransactions = async (req, res) => {
    const { userId } = req.user || {};
    const { limit = 50, offset = 0 } = req.query;

    const transactions = await client
      .db("main")
      .collection("wallet_transactions")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();

    res.status(200).json({ transactions });
  };

  const earnCurrency = async (req, res) => {
    const { userId } = req.user || {};
    const { currencyType, amount, reason } = req.body;

    if (!currencyType || !amount) {
      throw AppError.badRequest("currencyType и amount обязательны");
    }

    const currency = await client
      .db("main")
      .collection("currencies")
      .findOne({ type: currencyType });

    if (!currency) {
      throw AppError.notFound("Валюта не найдена");
    }

    await client
      .db("main")
      .collection("user_wallets")
      .updateOne(
        { userId: new ObjectId(userId), currencyId: currency._id },
        {
          $inc: { balance: amount },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      );

    await client.db("main").collection("wallet_transactions").insertOne({
      userId: new ObjectId(userId),
      currencyId: currency._id,
      type: "earn",
      amount,
      reason: reason || "manual",
      createdAt: new Date(),
    });

    res.status(200).json({ message: "Валюта начислена", amount });
  };

  return {
    getWallet,
    getTransactions,
    earnCurrency,
  };
};


