
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const skillSchema = new Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Skill', skillSchema);
