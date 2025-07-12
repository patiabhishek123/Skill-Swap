
import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
const swapFeedbackSchema = new Schema({
  swapId: { type: Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SwapFeedback', swapFeedbackSchema);
