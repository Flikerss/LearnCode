import { ObjectId } from "mongodb";
import AppError from "../errors/AppError.mjs";

export default (client) => {
  const getAllAchievements = async (req, res) => {
    const achievements = await client
      .db("main")
      .collection("achievements")
      .find({})
      .toArray();

    res.status(200).json({ achievements });
  };

  const getAchievementById = async (req, res) => {
    const { id } = req.params;
    const achievement = await client
      .db("main")
      .collection("achievements")
      .findOne({ _id: new ObjectId(id) });

    if (!achievement) {
      throw AppError.notFound("Достижение не найдено");
    }

    res.status(200).json({ achievement });
  };

  return {
    getAllAchievements,
    getAchievementById,
  };
};


