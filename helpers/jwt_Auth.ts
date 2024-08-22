import { expressjwt, IsRevoked } from "express-jwt";

export const isRevoked: IsRevoked = async (req, token) => {
  if (!token?.payload["isAdmin"]) {
    return true;
  }

  return false;
};

export const adminAuth = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
  isRevoked: isRevoked,
});

export const userAuth = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

export default {
  adminAuth,
  userAuth,
};
