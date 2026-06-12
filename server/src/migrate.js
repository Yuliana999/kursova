/**
 * Міграція: виправляє поле category у продуктах
 * Деякі товари мають category збережену як рядок замість ObjectId —
 * цей скрипт конвертує їх у правильний тип.
 *
 * Запуск (один раз):
 *   node --experimental-vm-modules src/migrate.js
 *   або якщо є npm script:
 *   npm run migrate
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

dotenv.config();
await connectDB();

const db = mongoose.connection;
const collection = db.collection('products');

// Знаходимо всі продукти де category — рядок (не ObjectId)
const products = await collection.find({}).toArray();

let fixed = 0;
let skipped = 0;

for (const product of products) {
  const cat = product.category;

  // Якщо вже ObjectId — пропускаємо
  if (cat instanceof mongoose.Types.ObjectId) {
    skipped++;
    continue;
  }

  // Якщо рядок — конвертуємо
  if (typeof cat === 'string' && /^[a-f\d]{24}$/i.test(cat)) {
    await collection.updateOne(
      { _id: product._id },
      { $set: { category: new mongoose.Types.ObjectId(cat) } }
    );
    console.log(`✅ Виправлено: "${product.name}" — category: "${cat}" → ObjectId`);
    fixed++;
  } else {
    console.log(`⚠️  Пропущено: "${product.name}" — category має невідомий формат:`, cat);
    skipped++;
  }
}

console.log(`\nГотово! Виправлено: ${fixed}, пропущено: ${skipped}`);
process.exit(0);
