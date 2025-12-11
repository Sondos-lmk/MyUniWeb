// models/Events/Club.js
import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
      trim: true,
    },
    logo: { type: String }, 
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Student who is the club president
    president: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // HR students who can review applications
    hrMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Optional – later we can add logo, social links, etc.
  },
  { timestamps: true }
);

export const Club = mongoose.model("Club", clubSchema);
