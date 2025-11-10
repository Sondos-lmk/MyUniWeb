import mongoose from "mongoose";
import { User } from "./User.js";

const adminSchema = new mongoose.Schema({
  notifications: {
    type: [String],
    default: [], // ✅ ensures new Admin starts with an empty array
  },
});

export const Admin = User.discriminator("admin", adminSchema);
