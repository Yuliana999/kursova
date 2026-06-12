import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type:mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  guestName: {type:String,default:''}, guestEmail:{type:String,default:''}, guestPhone:{type:String,default:''},
  items: [{productId:String,name:String,price:Number,qty:Number}],
  total: {type:Number,required:true},
  status: {type:String,enum:['нове','в обробці','відправлено','виконано','скасовано'],default:'нове'},
  address:{type:String,default:''}, comment:{type:String,default:''},
},{timestamps:true});
export default mongoose.model('Order', orderSchema);
