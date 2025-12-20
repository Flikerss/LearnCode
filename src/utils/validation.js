const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 50;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 64;

export function validateDisplayName(rawName) {
  const name = (rawName || "").trim();
  if (!name) return "Введите имя";
  if (name.length < NAME_MIN_LENGTH)
    return `Имя должно быть не короче ${NAME_MIN_LENGTH} символов`;
  if (name.length > NAME_MAX_LENGTH)
    return `Имя должно быть короче ${NAME_MAX_LENGTH} символов`;
  return null;
}

export function validatePassword(rawPassword) {
  const password = rawPassword || "";
  if (!password) return "Введите пароль";
  if (password.length < PASSWORD_MIN_LENGTH)
    return `Пароль должен быть не короче ${PASSWORD_MIN_LENGTH} символов`;
  if (password.length > PASSWORD_MAX_LENGTH)
    return `Пароль должен быть короче ${PASSWORD_MAX_LENGTH} символов`;
  return null;
}

export function validatePasswordWithConfirm(password, confirmPassword) {
  const baseError = validatePassword(password);
  if (baseError) return baseError;
  if (confirmPassword !== undefined && password !== confirmPassword)
    return "Пароли не совпадают";
  return null;
}
