import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [180, 'Description cannot exceed 180 characters'],
      default: '',
    },
    color: {
      type: String,
      default: 'from-indigo-500 to-purple-500',
    },
    icon: {
      type: String,
      default: 'HiOutlineTag',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;
