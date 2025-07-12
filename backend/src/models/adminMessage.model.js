
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const adminMessageSchema = new Schema({
  title: { type: String },
  body: { type: String },
  createdAt: { type: Date, default: Date.now },
  visibleUntil: { type: Date }
});

module.exports = mongoose.model('AdminMessage', adminMessageSchema);
