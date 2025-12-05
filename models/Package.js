import mongoose from 'mongoose';
const pkgSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, index: true, unique: true },
  shortDescription: String,
  description: String,
  price: Number,
  originalPrice: Number,
  region: String,
  category: String,
  days: Number,
  maxGuests: Number,
  images: [String],
  phone: String,
  email: String,
  youtube: String,
  amenities: [String],
  attractions: [String],
  status: { type: String, enum: ['active','draft','hidden'], default: 'active' }
}, { timestamps: true });

export default mongoose.model('Package', pkgSchema);
