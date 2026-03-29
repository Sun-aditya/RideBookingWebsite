const validateEmail = (email) => {
  if (!email) return false;
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(String(email).toLowerCase());
};

const validatePhone = (phone) => {
  if (!phone) return false;
  const digitsOnly = String(phone).replace(/\D/g, "");
  return digitsOnly.length >= 10;
};

const validatePassword = (password) => {
  if (!password) return false;
  return String(password).length >= 6;
};

const checkRequiredFields = (fields, body) => {
  return fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  checkRequiredFields,
};
