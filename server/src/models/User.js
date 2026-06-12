import mongoose from 'mongoose';
import crypto from 'crypto';
const userSchema = new mongoose.Schema({
  name:  { type:String, required:true, trim:true },
  email: { type:String, required:true, unique:true, lowercase:true, trim:true },
  password: { type:String, required:true },
  phone: { type:String, default:'' },
  role:  { type:String, enum:['client','admin'], default:'client' },
}, { timestamps:true });
userSchema.statics.hashPassword = p => crypto.createHash('sha256').update(p).digest('hex');
userSchema.statics.comparePassword = (p,h) => crypto.createHash('sha256').update(p).digest('hex') === h;
export default mongoose.model('User', userSchema);
