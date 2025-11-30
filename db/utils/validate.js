const security = require("../../config/security.json");
function validEmail(email) {
  return typeof email === "string" && /\S+@\S+\.\S+/.test(email);
}
function validPassword(pw) {
  return typeof pw === "string" && pw.length >= security.passwordPolicy.minLength;
}
function requiredFields(obj, fields) {
  return fields.every(f => obj[f] !== undefined && obj[f] !== null);
}
module.exports = { validEmail, validPassword, requiredFields };

