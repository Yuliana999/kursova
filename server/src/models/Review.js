import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // ObjectId для звичайних користувачів; для адміна — null
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Рядковий ідентифікатор — працює і для ObjectId, і для 'admin'
    userIdStr: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Оцінка обов\u02bcязкова'],
      min: [1, 'Мінімальна оцінка — 1'],
      max: [5, 'Максимальна оцінка — 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Відгук не може перевищувати 1000 символів'],
      default: '',
    },
  },
  { timestamps: true }
);

// Один відгук на товар від одного користувача (по рядковому id)
reviewSchema.index({ product: 1, userIdStr: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
