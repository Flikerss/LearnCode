import { client } from "../../app.mjs";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";
const PROGRESS_INCREMENT = 4;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const SALT_ROUNDS = 10;
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  maxAge: COOKIE_MAX_AGE,
  path: "/",
};
const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: REFRESH_COOKIE_MAX_AGE,
};

function setAuthCookie(res, token, refreshToken) {
  res.cookie("token", token, COOKIE_OPTIONS);
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  }
}

function clearAuthCookie(res) {
  res.clearCookie("token", { ...COOKIE_OPTIONS, maxAge: undefined });
  res.clearCookie("refreshToken", { ...REFRESH_COOKIE_OPTIONS, maxAge: undefined });
}

async function createSession(userId, refreshToken) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await client
    .db("main")
    .collection("sessions")
    .insertOne({
      userId: new ObjectId(userId),
      refreshToken,
      expiresAt,
      createdAt: new Date(),
    });
}

export default {
  async register(req, res) {
    const { name, email, password } = req.body;
    try {
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Имя, email и пароль обязательны" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Пароль должен содержать минимум 6 символов" });
      }

      const existingUser = await client
        .db("main")
        .collection("user")
        .findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ error: "Пользователь с таким email уже существует" });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      const newUser = {
        name,
        email,
        password: hashedPassword,
        role: "user",
        avatar: null,
        progress: 0,
        completedLessons: [],
        experience: 0,
        level: 1,
        streak: 0,
        lastActivityDate: new Date(),
        settings: {
          theme: "light",
          language: "ru",
          notifications: true,
        },
        privacy: {
          showProfile: true,
          showProgress: true,
          showAchievements: true,
        },
        currencies: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await client
        .db("main")
        .collection("user")
        .insertOne(newUser);
      newUser._id = result.insertedId;

      const { password: _, ...safeUser } = newUser;
      const token = jwt.sign(
        { userId: newUser._id.toString(), email: newUser.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      const refreshToken = jwt.sign(
        { userId: newUser._id.toString(), email: newUser.email },
        JWT_REFRESH_SECRET,
        { expiresIn: "30d" }
      );

      await createSession(newUser._id.toString(), refreshToken);
      setAuthCookie(res, token, refreshToken);

      res.status(201).json({
        message: `Пользователь '${newUser.name}' успешно зарегистрировался`,
        user: safeUser,
      });
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
      }
      const user = await client
        .db("main")
        .collection("user")
        .findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Неверные учетные данные" });
      }

      const isPasswordValid = user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Неверные учетные данные" });
      }

      if (!user.password.startsWith("$2")) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await client
          .db("main")
          .collection("user")
          .updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
          );
      }

      const { password: _, ...safeUser } = user;
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      const refreshToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        JWT_REFRESH_SECRET,
        { expiresIn: "30d" }
      );

      await createSession(user._id.toString(), refreshToken);
      setAuthCookie(res, token, refreshToken);

      res.status(200).json({
        message: `Пользователь '${user.name}' успешно вошел в аккаунт`,
        user: safeUser,
      });
    } catch (error) {
      console.error("Ошибка входа:", error);
      res.status(500).json({ error: error.message });
    }
  },

  logout(req, res) {
    const { userId } = req.user || {};
    if (userId) {
      client
        .db("main")
        .collection("sessions")
        .deleteMany({ userId: new ObjectId(userId) })
        .catch((err) => console.error("Ошибка удаления сессии:", err));
    }
    clearAuthCookie(res);
    res.status(200).json({ message: "Вы вышли из системы" });
  },

  async profile(req, res) {
    try {
      const { userId } = req.user || {};
      if (!userId) {
        return res.status(401).json({ error: "Необходимо авторизоваться" });
      }

      const user = await client
        .db("main")
        .collection("user")
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { password: 0 } }
        );

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const completedLessons = user.completedLessons || [];
      const lessons = await client
        .db("main")
        .collection("lessons")
        .find({
          _id: { $in: completedLessons.map((id) => new ObjectId(id)) },
        })
        .toArray();

      const lastLesson = completedLessons.length > 0
        ? await client
            .db("main")
            .collection("lessons")
            .findOne({ _id: new ObjectId(completedLessons[completedLessons.length - 1]) })
        : null;

      const userAchievements = await client
        .db("main")
        .collection("user_achievements")
        .find({ userId: new ObjectId(userId) })
        .toArray();

      const achievements = await client
        .db("main")
        .collection("achievements")
        .find({
          _id: { $in: userAchievements.map((ua) => ua.achievementId) },
        })
        .toArray();

      const userLessons = await client
        .db("main")
        .collection("user_lessons")
        .find({ userId: new ObjectId(userId) })
        .toArray();

      const chapters = await client
        .db("main")
        .collection("chapters")
        .find({})
        .toArray();

      const progressSummary = chapters.map((chapter) => {
        const chapterLessons = userLessons.filter(
          (ul) => ul.chapterId?.toString() === chapter._id.toString()
        );
        const completed = chapterLessons.filter((ul) => ul.status === "completed").length;
        return {
          chapterId: chapter._id.toString(),
          chapterTitle: chapter.title,
          total: chapter.lessons?.length || 0,
          completed,
          progress: chapter.lessons?.length > 0 
            ? Math.round((completed / chapter.lessons.length) * 100) 
            : 0,
        };
      });

      const wallets = await client
        .db("main")
        .collection("user_wallets")
        .find({ userId: new ObjectId(userId) })
        .toArray();

      const currency = wallets.reduce((acc, wallet) => {
        acc[wallet.currencyId] = wallet.balance || 0;
        return acc;
      }, {});

      res.status(200).json({
        user: {
          ...user,
          avatar: user.avatar || null,
          currency,
          achievements: achievements.map((a) => ({
            id: a._id.toString(),
            title: a.title,
            description: a.description,
            icon: a.icon,
            earnedAt: userAchievements.find(
              (ua) => ua.achievementId.toString() === a._id.toString()
            )?.earnedAt,
          })),
          progressSummary,
          streak: user.streak || 0,
          lastLesson: lastLesson
            ? {
                id: lastLesson._id.toString(),
                title: lastLesson.title,
              }
            : null,
          settings: user.settings || {
            theme: "light",
            language: "ru",
            notifications: true,
          },
          completedLessonsCount: completedLessons.length,
          completedLessons: lessons.map((l) => ({
            id: l._id.toString(),
            title: l.title,
          })),
        },
      });
    } catch (error) {
      console.error("Ошибка получения профиля:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      let users = await client.db("main").collection("user").find({}).toArray();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateProgress(req, res) {
    const { id: userId, lessonId } = req.params;
    try {
      const lesson = await client
        .db("main")
        .collection("lessons")
        .findOne({ _id: new ObjectId(lessonId) });
      if (!lesson) {
        return res.status(404).json({ message: "Урок не найден" });
      }

      const user = await client
        .db("main")
        .collection("user")
        .findOne({ _id: new ObjectId(userId) });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      let currentProgress =
        typeof user.progress === "string"
          ? parseInt(user.progress.replace("%", "")) || 0
          : user.progress || 0;
      const newProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

      const result = await client
        .db("main")
        .collection("user")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $set: { progress: newProgress } }
        );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      await client
        .db("main")
        .collection("lessons")
        .updateOne(
          { _id: new ObjectId(lessonId) },
          { $addToSet: { completedBy: new ObjectId(userId) } }
        );

      res.status(200).json({
        message: "Прогресс обновлен",
        userId: userId,
        lessonId: lessonId,
        lessonTitle: lesson.title,
        progressIncrement: PROGRESS_INCREMENT,
        oldProgress: currentProgress,
        newProgress: newProgress,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateName(req, res) {
    const { name } = req.body;
    const { id } = req.params;
    try {
      const result = await client
        .db("main")
        .collection("user")
        .updateOne({ _id: new ObjectId(id) }, { $set: { name: name, updatedAt: new Date() } });
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      res.status(200).json({
        message: "Имя пользователя обновлено",
        userId: id,
        newName: name,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSettings(req, res) {
    try {
      const { userId } = req.user || {};
      const user = await client
        .db("main")
        .collection("user")
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { settings: 1, privacy: 1 } }
        );
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      res.status(200).json({
        settings: user.settings || { theme: "light", language: "ru", notifications: true },
        privacy: user.privacy || { showProfile: true, showProgress: true, showAchievements: true },
      });
    } catch (error) {
      console.error("Ошибка получения настроек:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateSettings(req, res) {
    try {
      const { userId } = req.user || {};
      const { settings, privacy } = req.body;
      const updateData = { updatedAt: new Date() };
      if (settings) updateData.settings = settings;
      if (privacy) updateData.privacy = privacy;

      const result = await client
        .db("main")
        .collection("user")
        .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.status(200).json({ message: "Настройки обновлены" });
    } catch (error) {
      console.error("Ошибка обновления настроек:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateAvatar(req, res) {
    try {
      const { userId } = req.user || {};
      const { avatar } = req.body;
      if (!avatar) {
        return res.status(400).json({ error: "Avatar обязателен" });
      }

      const result = await client
        .db("main")
        .collection("user")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $set: { avatar, updatedAt: new Date() } }
        );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.status(200).json({ message: "Аватар обновлен", avatar });
    } catch (error) {
      console.error("Ошибка обновления аватара:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updatePassword(req, res) {
    try {
      const { userId } = req.user || {};
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Текущий и новый пароль обязательны" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Новый пароль должен содержать минимум 6 символов" });
      }

      const user = await client
        .db("main")
        .collection("user")
        .findOne({ _id: new ObjectId(userId) });

      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      const isPasswordValid = user.password.startsWith("$2")
        ? await bcrypt.compare(currentPassword, user.password)
        : user.password === currentPassword;

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Неверный текущий пароль" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await client
        .db("main")
        .collection("user")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $set: { password: hashedPassword, updatedAt: new Date() } }
        );

      res.status(200).json({ message: "Пароль успешно изменен" });
    } catch (error) {
      console.error("Ошибка обновления пароля:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getPreferences(req, res) {
    try {
      const { userId } = req.user || {};
      const profile = await client
        .db("main")
        .collection("profiles")
        .findOne({ userId: new ObjectId(userId) });

      res.status(200).json({
        preferences: profile?.preferences || {},
        bio: profile?.bio || "",
        socials: profile?.socials || {},
      });
    } catch (error) {
      console.error("Ошибка получения предпочтений:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updatePreferences(req, res) {
    try {
      const { userId } = req.user || {};
      const { preferences, bio, socials } = req.body;

      const updateData = { userId: new ObjectId(userId), updatedAt: new Date() };
      if (preferences) updateData.preferences = preferences;
      if (bio !== undefined) updateData.bio = bio;
      if (socials) updateData.socials = socials;

      await client
        .db("main")
        .collection("profiles")
        .updateOne(
          { userId: new ObjectId(userId) },
          { $set: updateData },
          { upsert: true }
        );

      res.status(200).json({ message: "Предпочтения обновлены" });
    } catch (error) {
      console.error("Ошибка обновления предпочтений:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getProgress(req, res) {
    try {
      const { userId } = req.user || {};
      const user = await client
        .db("main")
        .collection("user")
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { progress: 1, experience: 1, level: 1, streak: 1, lastActivityDate: 1 } }
        );

      const userLessons = await client
        .db("main")
        .collection("user_lessons")
        .find({ userId: new ObjectId(userId) })
        .sort({ completedAt: -1 })
        .limit(5)
        .toArray();

      const lastLessons = await Promise.all(
        userLessons.map(async (ul) => {
          const lesson = await client
            .db("main")
            .collection("lessons")
            .findOne({ _id: ul.lessonId });
          return lesson
            ? {
                id: lesson._id.toString(),
                title: lesson.title,
                completedAt: ul.completedAt,
                score: ul.score,
              }
            : null;
        })
      );

      const chapters = await client
        .db("main")
        .collection("chapters")
        .find({})
        .toArray();

      const chapterProgress = await Promise.all(
        chapters.map(async (chapter) => {
          const chapterLessons = await client
            .db("main")
            .collection("user_lessons")
            .find({
              userId: new ObjectId(userId),
              chapterId: chapter._id,
            })
            .toArray();
          const completed = chapterLessons.filter((ul) => ul.status === "completed").length;
          return {
            chapterId: chapter._id.toString(),
            title: chapter.title,
            total: chapter.lessons?.length || 0,
            completed,
            progress: chapter.lessons?.length > 0
              ? Math.round((completed / chapter.lessons.length) * 100)
              : 0,
          };
        })
      );

      res.status(200).json({
        overallProgress: user?.progress || 0,
        experience: user?.experience || 0,
        level: user?.level || 1,
        streak: user?.streak || 0,
        lastActivityDate: user?.lastActivityDate,
        lastLessons: lastLessons.filter((l) => l !== null),
        chapterProgress,
      });
    } catch (error) {
      console.error("Ошибка получения прогресса:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getAchievements(req, res) {
    try {
      const { userId } = req.user || {};
      const userAchievements = await client
        .db("main")
        .collection("user_achievements")
        .find({ userId: new ObjectId(userId) })
        .toArray();

      const achievementIds = userAchievements.map((ua) => ua.achievementId);
      const achievements = await client
        .db("main")
        .collection("achievements")
        .find({ _id: { $in: achievementIds } })
        .toArray();

      const allAchievements = await client
        .db("main")
        .collection("achievements")
        .find({})
        .toArray();

      const achievementsWithStatus = allAchievements.map((achievement) => {
        const userAchievement = userAchievements.find(
          (ua) => ua.achievementId.toString() === achievement._id.toString()
        );
        return {
          id: achievement._id.toString(),
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          reward: achievement.reward,
          earned: !!userAchievement,
          earnedAt: userAchievement?.earnedAt || null,
        };
      });

      res.status(200).json({ achievements: achievementsWithStatus });
    } catch (error) {
      console.error("Ошибка получения достижений:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async updateRole(req, res) {
    try {
      const { userId } = req.user || {};
      const { targetUserId, role } = req.body;

      if (!targetUserId || !role) {
        return res.status(400).json({ error: "targetUserId и role обязательны" });
      }

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ error: "Роль должна быть 'user' или 'admin'" });
      }

      // Проверяем, что текущий пользователь - админ
      const currentUser = await client
        .db("main")
        .collection("user")
        .findOne({ _id: new ObjectId(userId) }, { projection: { role: 1 } });

      if (!currentUser || currentUser.role !== "admin") {
        return res.status(403).json({ error: "Только администраторы могут изменять роли" });
      }

      // Обновляем роль пользователя
      const result = await client
        .db("main")
        .collection("user")
        .updateOne(
          { _id: new ObjectId(targetUserId) },
          { $set: { role: role, updatedAt: new Date() } }
        );

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.status(200).json({ message: `Роль пользователя успешно изменена на '${role}'` });
    } catch (error) {
      console.error("Ошибка обновления роли:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async makeFirstAdmin(req, res) {
    try {
      // Проверяем, есть ли уже админы в системе
      const existingAdmin = await client
        .db("main")
        .collection("user")
        .findOne({ role: "admin" });

      if (existingAdmin) {
        return res.status(403).json({ 
          error: "В системе уже есть администратор. Используйте endpoint /api/user/role для изменения ролей." 
        });
      }

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email обязателен" });
      }

      // Находим пользователя по email
      const user = await client
        .db("main")
        .collection("user")
        .findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "Пользователь с таким email не найден" });
      }

      // Делаем его админом
      await client
        .db("main")
        .collection("user")
        .updateOne(
          { _id: user._id },
          { $set: { role: "admin", updatedAt: new Date() } }
        );

      res.status(200).json({ 
        message: `Пользователь ${email} успешно назначен администратором`,
        userId: user._id.toString()
      });
    } catch (error) {
      console.error("Ошибка назначения первого админа:", error);
      res.status(500).json({ error: error.message });
    }
  },
};
