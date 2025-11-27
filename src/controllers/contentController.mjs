import { ObjectId } from "mongodb";

export default (client) => {
  const getContent = async (req, res) => {
    try {
      const { type } = req.params;
      const content = await client
        .db("main")
        .collection("content_blocks")
        .findOne({ type });

      if (!content) {
        return res.status(404).json({ error: "Контент не найден" });
      }

      res.status(200).json({ content: content.data });
    } catch (error) {
      console.error("Ошибка получения контента:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const updateContent = async (req, res) => {
    try {
      const { type } = req.params;
      const { data } = req.body;

      if (!data) {
        return res.status(400).json({ error: "data обязателен" });
      }

      await client
        .db("main")
        .collection("content_blocks")
        .updateOne(
          { type },
          {
            $set: {
              type,
              data,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );

      res.status(200).json({ message: "Контент обновлен" });
    } catch (error) {
      console.error("Ошибка обновления контента:", error);
      res.status(500).json({ error: error.message });
    }
  };

  return {
    getContent,
    updateContent,
  };
};


