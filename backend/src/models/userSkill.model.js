
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const userSkillSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
  type: { type: String, enum: ['offered', 'wanted'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserSkill', userSkillSchema);
