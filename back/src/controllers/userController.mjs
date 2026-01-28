import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/index.mjs";
import AppError from "../errors/AppError.mjs";

const PROGRESS_INCREMENT = 4;

export default function userControllerFactory(client) {
  const db = () => client.db(config.db.name);
  const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict",
    secure: config.env === "production",
    maxAge: config.security.cookieMaxAge,
    path: "/",
  };
  const REFRESH_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: config.security.refreshCookieMaxAge,
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
    await db()
      .collection("sessions")
    .insertOne({
      userId: new ObjectId(userId),
      refreshToken,
      expiresAt,
      createdAt: new Date(),
    });
  }

  return {
  async register(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw AppError.badRequest("Имя, email и пароль обязательны");
    }
    if (password.length < 6) {
      throw AppError.badRequest("Пароль должен содержать минимум 6 символов");
    }

    const existingUser = await db()
      .collection("user")
      .findOne({ email });
    if (existingUser) {
      throw AppError.conflict("Пользователь с таким email уже существует");
    }

    const hashedPassword = await bcrypt.hash(password, config.security.saltRounds);

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
    const result = await db()
      .collection("user")
      .insertOne(newUser);
    newUser._id = result.insertedId;

    const { password: _, ...safeUser } = newUser;
    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpires }
    );
    const refreshToken = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpires }
    );

    await createSession(newUser._id.toString(), refreshToken);
    setAuthCookie(res, token, refreshToken);

    res.status(201).json({
      message: `Пользователь '${newUser.name}' успешно зарегистрировался`,
      user: safeUser,
    });
  },

  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw AppError.badRequest("Email и пароль обязательны");
    }
    const user = await db()
      .collection("user")
      .findOne({ email });
    if (!user) {
      throw AppError.unauthorized("Неверные учетные данные");
    }

    const isPasswordValid = user.password.startsWith("$2")
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isPasswordValid) {
      throw AppError.unauthorized("Неверные учетные данные");
    }

      if (!user.password.startsWith("$2")) {
        const hashedPassword = await bcrypt.hash(password, config.security.saltRounds);
        await db()
          .collection("user")
          .updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
          );
      }

      const { password: _, ...safeUser } = user;
      const token = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpires }
      );
      const refreshToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpires }
      );

      await createSession(user._id.toString(), refreshToken);
      setAuthCookie(res, token, refreshToken);

    res.status(200).json({
      message: `Пользователь '${user.name}' успешно вошел в аккаунт`,
      user: safeUser,
    });
  },

  logout(req, res) {
    const { userId } = req.user || {};
    if (userId) {
      db()
        .collection("sessions")
        .deleteMany({ userId: new ObjectId(userId) })
        .catch((err) => console.error("Ошибка удаления сессии:", err));
    }
    clearAuthCookie(res);
    res.status(200).json({ message: "Вы вышли из системы" });
  },

  async profile(req, res) {
    const { userId } = req.user || {};
    if (!userId) {
      throw AppError.unauthorized("Необходимо авторизоваться");
    }

    const user = await db()
      .collection("user")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0 } }
      );

    if (!user) {
      throw AppError.notFound("Пользователь не найден");
    }

      const completedLessons = user.completedLessons || [];
      const lessons = await db()
        .collection("lessons")
        .find({
          _id: { $in: completedLessons.map((id) => new ObjectId(id)) },
        })
        .toArray();

      const lastLesson = completedLessons.length > 0
        ? await db()
            .collection("lessons")
            .findOne({ _id: new ObjectId(completedLessons[completedLessons.length - 1]) })
        : null;

      const userAchievements = await db()
        .collection("user_achievements")
        .find({ userId: new ObjectId(userId) })
        .toArray();

      const achievements = await db()
        .collection("achievements")
        .find({
          _id: { $in: userAchievements.map((ua) => ua.achievementId) },
        })
        .toArray();

      const userLessons = await db()
        .collection("user_lessons")
        .find({ userId: new ObjectId(userId) })
        .toArray();

      const chapters = await db()
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

      const wallets = await db()
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
  },

  async getAll(req, res) {
    const users = await db()
      .collection("user")
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.status(200).json(users);
  },

  async updateProgress(req, res) {
    const { id: userId, lessonId } = req.params;
    const lesson = await db()
      .collection("lessons")
      .findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) {
      throw AppError.notFound("Урок не найден");
    }

    const user = await db()
      .collection("user")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw AppError.notFound("Пользователь не найден");
    }

    let currentProgress =
      typeof user.progress === "string"
        ? parseInt(user.progress.replace("%", "")) || 0
        : user.progress || 0;
    const newProgress = Math.min(currentProgress + PROGRESS_INCREMENT, 100);

    const result = await db()
      .collection("user")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { progress: newProgress } }
      );

    if (result.modifiedCount === 0) {
      throw AppError.notFound("Пользователь не найден");
    }

    await db()
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
  },

  async updateName(req, res) {
    const { name } = req.body;
    const { id } = req.params;
    const result = await db()
      .collection("user")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name: name, updatedAt: new Date() } });
    if (result.modifiedCount === 0) {
      throw AppError.notFound("Пользователь не найден");
    }
    res.status(200).json({
      message: "Имя пользователя обновлено",
      userId: id,
      newName: name,
    });
  },

  async getSettings(req, res) {
    const { userId } = req.user || {};
    const user = await db()
      .collection("user")
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { settings: 1, privacy: 1 } }
      );
    if (!user) {
      throw AppError.notFound("Пользователь не найден");
    }
    res.status(200).json({
      settings: user.settings || { theme: "light", language: "ru", notifications: true },
      privacy: user.privacy || { showProfile: true, showProgress: true, showAchievements: true },
    });
  },

  async updateSettings(req, res) {
    const { userId } = req.user || {};
    const { settings, privacy } = req.body;
    const updateData = { updatedAt: new Date() };
    if (settings) updateData.settings = settings;
    if (privacy) updateData.privacy = privacy;

    const result = await db()
      .collection("user")
      .updateOne({ _id: new ObjectId(userId) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      throw AppError.notFound("Пользователь не найден");
    }

    res.status(200).json({ message: "Настройки обновлены" });
  },

  async updateAvatar(req, res) {
    const { userId } = req.user || {};
    const { avatar } = req.body;
    if (!avatar) {
      throw AppError.badRequest("Avatar обязателен");
    }

    const result = await db()
      .collection("user")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { avatar, updatedAt: new Date() } }
      );

    if (result.modifiedCount === 0) {
      throw AppError.notFound("Пользователь не найден");
    }

    res.status(200).json({ message: "Аватар обновлен", avatar });
  },

  async updatePassword(req, res) {
    const { userId } = req.user || {};
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw AppError.badRequest("Текущий и новый пароль обязательны");
    }
    if (newPassword.length < 6) {
      throw AppError.badRequest("Новый пароль должен содержать минимум 6 символов");
    }

    const user = await db()
      .collection("user")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw AppError.notFound("Пользователь не найден");
    }

    const isPasswordValid = user.password.startsWith("$2")
      ? await bcrypt.compare(currentPassword, user.password)
      : user.password === currentPassword;

    if (!isPasswordValid) {
      throw AppError.unauthorized("Неверный текущий пароль");
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.security.saltRounds);
    await db()
      .collection("user")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

    res.status(200).json({ message: "Пароль успешно изменен" });
  },

  async getPreferences(req, res) {
    const { userId } = req.user || {};
    const profile = await db()
      .collection("profiles")
      .findOne({ userId: new ObjectId(userId) });

    res.status(200).json({
      preferences: profile?.preferences || {},
      bio: profile?.bio || "",
      socials: profile?.socials || {},
    });
  },

  async updatePreferences(req, res) {
    const { userId } = req.user || {};
    const { preferences, bio, socials } = req.body;

    const updateData = { userId: new ObjectId(userId), updatedAt: new Date() };
    if (preferences) updateData.preferences = preferences;
    if (bio !== undefined) updateData.bio = bio;
    if (socials) updateData.socials = socials;

    await db()
      .collection("profiles")
      .updateOne(
        { userId: new ObjectId(userId) },
        { $set: updateData },
        { upsert: true }
      );

    res.status(200).json({ message: "Предпочтения обновлены" });
  },

  async getProgress(req, res) {
    const { userId } = req.user || {};
      const user = await db()
        .collection("user")
        .findOne(
          { _id: new ObjectId(userId) },
          { projection: { progress: 1, experience: 1, level: 1, streak: 1, lastActivityDate: 1 } }
        );

      const userLessons = await db()
        .collection("user_lessons")
        .find({ userId: new ObjectId(userId) })
        .sort({ completedAt: -1 })
        .limit(5)
        .toArray();

      const lastLessons = await Promise.all(
        userLessons.map(async (ul) => {
const lesson = await db()
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

      const chapters = await db()
        .collection("chapters")
        .find({})
        .toArray();

      const chapterProgress = await Promise.all(
        chapters.map(async (chapter) => {
          const chapterLessons = await       db()
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
  },

  async getAchievements(req, res) {
    const { userId } = req.user || {};
    const userAchievements = await db()
      .collection("user_achievements")
      .find({ userId: new ObjectId(userId) })
      .toArray();

    const achievementIds = userAchievements.map((ua) => ua.achievementId);
    const achievements = await db()
      .collection("achievements")
      .find({ _id: { $in: achievementIds } })
      .toArray();

    const allAchievements = await db()
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
  },
};
}
