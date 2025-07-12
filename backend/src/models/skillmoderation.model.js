
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const skillModerationLogSchema = new Schema({
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['approved', 'rejected'], required: true },
  reason: { type: String },
  actionAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SkillModerationLog', skillModerationLogSchema);
