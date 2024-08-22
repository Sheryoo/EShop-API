import { Schema, model } from "mongoose";

const orderItemScheme = new Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
});

export const OrderItem = model("OrderItem", orderItemScheme);

export default OrderItem;
