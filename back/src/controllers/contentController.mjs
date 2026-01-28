import { ObjectId } from "mongodb";
import AppError from "../errors/AppError.mjs";

export default (client) => {
  const getContent = async (req, res) => {
    const { type } = req.params;
    const content = await client
      .db("main")
      .collection("content_blocks")
      .findOne({ type });

    if (!content) {
      throw AppError.notFound("Контент не найден");
    }

    res.status(200).json({ content: content.data });
  };

  const updateContent = async (req, res) => {
    const { type } = req.params;
    const { data } = req.body;

    if (!data) {
      throw AppError.badRequest("data обязателен");
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
  };

  return {
    getContent,
    updateContent,
  };
};


