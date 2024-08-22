import { Schema, model } from "mongoose";

const categoryScheme = new Schema({
  name: {
    type: String,
    require: true,
    unique: true,
  },
  icon: {
    type: String,
  },
  labelColor: {
    type: String,
  },
});

export const Category = model("Category", categoryScheme);

export default Category;
