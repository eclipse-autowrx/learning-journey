import { Schema, model, models } from 'mongoose';

const AdminSchema = new Schema({
  user_id: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
});

const Admin = models.Admin || model('Admin', AdminSchema);

export default Admin;
