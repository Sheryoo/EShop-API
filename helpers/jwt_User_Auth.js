const expressJwt = require("express-jwt");

const userAuth = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

module.exports = userAuth;
