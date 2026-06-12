import express from 'express';
import Order from '../models/Order.js';
const router = express.Router();
router.post('/', async (req,res) => {
  try {
    const {userId,guestName,guestEmail,guestPhone,items,total,address,comment} = req.body;
    if (!items?.length) return res.status(400).json({success:false,message:'Кошик порожній'});
    const order = await Order.create({user:userId||null,guestName:guestName||'',guestEmail:guestEmail||'',guestPhone:guestPhone||'',items,total,address:address||'',comment:comment||''});
    res.status(201).json({success:true,data:order});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});
router.get('/', async (req,res) => {
  try {
    const filter = req.query.userId ? { user: req.query.userId } : {};
    const orders = await Order.find(filter).sort({createdAt:-1}).populate('user','name email');
    res.json({success:true,count:orders.length,data:orders});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});
router.patch('/:id/status', async (req,res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});
    if (!order) return res.status(404).json({success:false,message:'Не знайдено'});
    res.json({success:true,data:order});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});
export default router;
