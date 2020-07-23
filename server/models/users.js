import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, unique: false, required: true },
    nickname: { type: String, unique: true, required: true },
    server: { type: String, unique: false, required: true },
    guild: { type: String, unique: false, required: false },
    farm: { type: String, unique: false, required: false },
    profile: { type: String, unique: true, required: false },
    bio: { type: String, unique: false, required: false, default: "" },
    email_secret: { type: String, unique: false, required: false },
    email_valid: { type: Boolean, unique: false, required: true, default: false },
    is_admin: { type: Boolean, unique: false, required: true, default: false },
    is_activated: { type: Boolean, unique: false, required: true, default: true },
});

userSchema.plugin(mongoosePaginate);

export const userModel = mongoose.model("User", userSchema);
