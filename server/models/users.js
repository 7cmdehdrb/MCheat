import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, unique: false, required: true },
    nickname: { type: String, unique: true, required: true },
    server: { type: String, unique: false, required: true },
    guild: { type: String, unique: false, required: false },
    farm: { type: String, unique: false, required: false },
});

export const userModel = mongoose.model("User", userSchema);
