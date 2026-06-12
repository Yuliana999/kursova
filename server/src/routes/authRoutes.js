import express from 'express';
import User from '../models/User.js';
const router = express.Router();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@maison.ua';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

router.post('/register', async (req,res) => {
  try {
    const {name,email,password,phone} = req.body;
    if (!name||!email||!password) return res.status(400).json({success:false,message:'Заповніть усі поля'});
    if (await User.findOne({email:email.toLowerCase()})) return res.status(400).json({success:false,message:'Email вже зареєстровано'});
    const user = await User.create({name,email,phone:phone||'',password:User.hashPassword(password)});
    res.status(201).json({success:true,data:{_id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role}});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});

router.post('/login', async (req,res) => {
  try {
    const {email,password} = req.body;
    if (!email||!password) return res.status(400).json({success:false,message:'Введіть email і пароль'});
    if (email.toLowerCase()===ADMIN_EMAIL.toLowerCase()) {
      if (password!==ADMIN_PASSWORD) return res.status(401).json({success:false,message:'Невірний пароль'});
      return res.json({success:true,data:{_id:'admin',name:'Адміністратор',email:ADMIN_EMAIL,role:'admin'}});
    }
    const user = await User.findOne({email:email.toLowerCase()});
    if (!user||!User.comparePassword(password,user.password)) return res.status(401).json({success:false,message:'Невірний email або пароль'});
    res.json({success:true,data:{_id:user._id,name:user.name,email:user.email,phone:user.phone,role:user.role}});
  } catch(e){res.status(500).json({success:false,message:e.message});}
});
export default router;
