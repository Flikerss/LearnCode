import { ObjectId } from "mongodb";

export default (client) => {
  const getAllAchievements = async (req, res) => {
    try {
      const achievements = await client
        .db("main")
        .collection("achievements")
        .find({})
        .toArray();

      res.status(200).json({ achievements });
    } catch (error) {
      console.error("Ошибка получения достижений:", error);
      res.status(500).json({ error: error.message });
    }
  };

  const getAchievementById = async (req, res) => {
    try {
      const { id } = req.params;
      const achievement = await client
        .db("main")
        .collection("achievements")
        .findOne({ _id: new ObjectId(id) });

      if (!achievement) {
        return res.status(404).json({ error: "Достижение не найдено" });
      }

      res.status(200).json({ achievement });
    } catch (error) {
      console.error("Ошибка получения достижения:", error);
      res.status(500).json({ error: error.message });
    }
  };

  return {
    getAllAchievements,
    getAchievementById,
  };
};


