const expressJwt = require("express-jwt");

const authJwt = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  isRevoked: isRevoked,
});

async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    return done(null, true);
  }
  return done();
}

module.exports = authJwt;
