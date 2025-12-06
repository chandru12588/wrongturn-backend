import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({
  name: { type: String, default: 'admin' },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' }
}, { timestamps: true });




export default mongoose.model('admin', adminSchema);
