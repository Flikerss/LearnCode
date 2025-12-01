import { ObjectId } from "mongodb";

export default (client) => {
  const getWallet = async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Ошибка получения кошелька:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const getTransactions = async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Ошибка получения транзакций:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const earnCurrency = async (req, res) => {
    try {
      const { userId } = req.user || {};
      const { currencyType, amount, reason } = req.body;

      if (!currencyType || !amount) {
        return res.status(400).json({ error: "currencyType и amount обязательны" });
      }

      const currency = await client
        .db("main")
        .collection("currencies")
        .findOne({ type: currencyType });

      if (!currency) {
        return res.status(404).json({ error: "Валюта не найдена" });
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
    } catch (error) {
      console.error("Ошибка начисления валюты:", error);
      res.status(500).json({ error: error.message });
    }
  };

  return {
    getWallet,
    getTransactions,
    earnCurrency,
  };
};


