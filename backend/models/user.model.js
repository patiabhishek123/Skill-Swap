import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    name: String,
    email: String,
    location: String,
    profilePhoto: String,
    skillsOffered: [String],
    skillsWanted: [String],
    availability: [String],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model("User", UserSchema);
