
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const swapRequestSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  offeredSkillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  requestedSkillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  message: { type: String },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('SwapRequest', swapRequestSchema);
