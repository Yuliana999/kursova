import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema({
  name:{type:String,required:true}, email:{type:String,required:true},
  phone:{type:String,default:''}, message:{type:String,required:true}, isRead:{type:Boolean,default:false},
  adminReply:{type:String,default:''},
  repliedAt:{type:Date,default:null},
},{timestamps:true});
export default mongoose.model('Contact', contactSchema);
