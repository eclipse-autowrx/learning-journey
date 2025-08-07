import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PathSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, limit: 1024 },
    description: { type: String, limit: 4096 },
    slug: { type: String, required: true, unique: true },
    path_type: { type: String, default: "standard" },
    background_img: { type: String },
    image: { type: String },
    thumb: { type: String },
    category: { type: String, limit: 255 },
    tags: { type: [String] },
    valid_from: { type: Date },
    valid_to: { type: Date },
    state: { type: String, limit: 255, default: 'draft' },   // draft, reviewed, released
    configs: { type: Schema.Types.Mixed },
    extends: { type: Schema.Types.Mixed },
    hiddenContent: { type: Schema.Types.Mixed },
    maps: { type: Schema.Types.Mixed },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

PathSchema.index({ category: 1 });
PathSchema.index({ slug: 1 });
PathSchema.index({ tags: 1 });
PathSchema.index({ name: 1 });
PathSchema.index({ state: 1 });


export default mongoose.models.Path || mongoose.model("Path", PathSchema);