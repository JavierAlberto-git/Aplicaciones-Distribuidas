const crypto = require("crypto");

function hashSHA256(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

console.log(hashSHA256("pass1"));