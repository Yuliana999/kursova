import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Назва категорії обовʼязкова'],
      trim: true,
      unique: true,
      maxlength: [100, 'Назва не може перевищувати 100 символів'],
    },
    slug: {
      type: String,
      required: [true, 'Slug обовʼязковий'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
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

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
