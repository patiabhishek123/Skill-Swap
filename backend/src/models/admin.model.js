
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const adminSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['moderator', 'superadmin'], default: 'moderator' },
  createdAt: { type: Date, default: Date.now }
});
