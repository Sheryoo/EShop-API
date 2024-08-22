import { Schema, model } from "mongoose";

const userScheme = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "https://cdn-icons-png.freepik.com/512/3033/3033143.png",
  },
  gender: {
    type: String,
    required: true,
    enum: ["M", "F", "O"],
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  zip: {
    type: String,
    default: "",
  },
  apartment: {
    type: String,
    default: "",
  },
  street: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
});

userScheme.virtual("id").get(function () {
  return this._id.toHexString();
});

userScheme.set("toJSON", {
  virtuals: true,
});

export const User = model("User", userScheme);

export default User;
