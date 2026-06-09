import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
      default: 'General',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'review', 'done'],
        message: 'Status must be todo, in-progress, review, or done',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    reminderDate: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: String,
      default: null,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    subtasks: {
      type: [
        {
          id: String,
          title: String,
          completed: Boolean,
        },
      ],
      default: [],
    },
    comments: {
      type: [
        {
          id: String,
          author: String,
          message: String,
          createdAt: Date,
        },
      ],
      default: [],
    },
    attachments: {
      type: [
        {
          id: String,
          name: String,
          url: String,
        },
      ],
      default: [],
    },
    timeEstimate: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
TaskSchema.index({ userId: 1, createdAt: -1 });
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, priority: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, reminderDate: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

export default Task;
