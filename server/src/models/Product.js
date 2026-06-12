import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Назва товару обовʼязкова'],
      trim: true,
      maxlength: [255, 'Назва не може перевищувати 255 символів'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Ціна обовʼязкова'],
      min: [0, 'Ціна не може бути відʼємною'],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: [0, 'Знижка не може бути відʼємною'],
      max: [100, 'Знижка не може перевищувати 100%'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Кількість на складі обовʼязкова'],
      default: 0,
      min: [0, 'Кількість не може бути відʼємною'],
      validate: {
        validator: Number.isInteger,
        message: 'Кількість має бути цілим числом',
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Категорія обовʼязкова'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('finalPrice').get(function () {
  if (this.discountPercent > 0) {
    return +(this.price * (1 - this.discountPercent / 100)).toFixed(2);
  }
  return this.price;
});

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discountPercent: -1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
