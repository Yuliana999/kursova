import express from 'express';
import Contact from '../models/Contact.js';
const router = express.Router();

router.post('/', async (req,res) => {
  try {
    const {name,email,phone,message} = req.body;
    if (!name||!email||!message) return res.status(400).json({success:false,message:"Заповніть обов'язкові поля"});
    const c = await Contact.create({name,email,phone:phone||'',message});
    res.status(201).json({success:true,data:c});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.get('/', async (req,res) => {
  try {
    const contacts = await Contact.find().sort({createdAt:-1});
    res.json({success:true,count:contacts.length,data:contacts});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.patch('/:id/read', async (req,res) => {
  try {
    const c = await Contact.findByIdAndUpdate(req.params.id,{isRead:true},{new:true});
    if (!c) return res.status(404).json({success:false,message:'Не знайдено'});
    res.json({success:true,data:c});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

// Новий маршрут: відповідь адміна
router.patch('/:id/reply', async (req,res) => {
  try {
    const {reply} = req.body;
    if (!reply || !reply.trim()) return res.status(400).json({success:false,message:'Відповідь не може бути порожньою'});
    const c = await Contact.findByIdAndUpdate(
      req.params.id,
      {adminReply: reply.trim(), repliedAt: new Date(), isRead: true},
      {new:true}
    );
    if (!c) return res.status(404).json({success:false,message:'Не знайдено'});
    res.json({success:true,data:c});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

// Видалення звернення
router.delete('/:id', async (req,res) => {
  try {
    const c = await Contact.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({success:false,message:'Не знайдено'});
    res.json({success:true,message:'Видалено'});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

// Клієнт перевіряє чи є відповідь адміна (за email)
router.get('/check-reply', async (req,res) => {
  try {
    const {email} = req.query;
    if (!email) return res.status(400).json({success:false,message:'Email обов\'язковий'});
    const contacts = await Contact.find({email, adminReply:{$ne:''}}).sort({repliedAt:-1}).limit(5);
    res.json({success:true,data:contacts});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

export default router;
