import { ObjectId } from "mongodb";

export default (client) => {
  const createFeedback = async (req, res) => {
    try {
      const { name, email, message, type = "general", rating } = req.body;
      const { userId } = req.user || {};

      if (!name || !email || !message) {
        return res.status(400).json({ error: "Имя, email и сообщение обязательны" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Некорректный email" });
      }

      const feedback = {
        userId: userId ? new ObjectId(userId) : null,
        name,
        email,
        message,
        type,
        rating: rating || null,
        status: "new",
        createdAt: new Date(),
      };

      const result = await client
        .db("main")
        .collection("feedback")
        .insertOne(feedback);

      await client.db("main").collection("notifications").insertOne({
        type: "feedback",
        userId: null,
        title: "Новое обращение",
        message: `Получено обращение от ${name}`,
        data: { feedbackId: result.insertedId },
        read: false,
        createdAt: new Date(),
      });

      res.status(201).json({
        message: "Обращение успешно отправлено",
        feedbackId: result.insertedId.toString(),
      });
    } catch (error) {
      console.error("Ошибка создания feedback:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const getFeedback = async (req, res) => {
    try {
      const { userId } = req.user || {};
      const { limit = 10, offset = 0 } = req.query;

      const query = userId ? { userId: new ObjectId(userId) } : {};
      const feedback = await client
        .db("main")
        .collection("feedback")
        .find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .toArray();

      res.status(200).json({ feedback });
    } catch (error) {
      console.error("Ошибка получения feedback:", error);
      res.status(500).json({ error: error.message });
    }
  };

  return {
    createFeedback,
    getFeedback,
  };
};


