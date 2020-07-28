import mongoose from "mongoose";
import "./users";
import { Schema } from "mongoose";

const instantMessageSchema = new mongoose.Schema(
    {
        to: { type: String, unique: false, required: true },
        from: { type: String, unique: false, required: true },
        message: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    if (v.length > 50) {
                        return false;
                    }
                },
            },
        },
        time: { type: Date, unique: false, required: false, default: new Date() },
    },
    {
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    }
);

instantMessageSchema.virtual("toUser", {
    ref: "User",
    localField: "to",
    foreignField: "nickname",
    justOne: true,
});

instantMessageSchema.virtual("fromUser", {
    ref: "User",
    localField: "from",
    foreignField: "nickname",
    justOne: true,
});

export const InstantMessage = mongoose.model("InstantMessage", instantMessageSchema);

const groupMessageRoomSchema = new mongoose.Schema({
    name: { type: String, unique: false, required: true },
    password: { type: String, unique: false, required: true },
    masterEmail: { type: String, unique: false, required: true },
    roomMember: [{ type: String, unique: false, required: true }],
});

groupMessageRoomSchema.virtual("master", {
    ref: "User",
    localField: "masterEmail",
    foreignField: "email",
    justOne: true,
});

export const GroupMessageRoom = mongoose.model("GroupMessageRoom", groupMessageRoomSchema);

const groupMessageSchema = new mongoose.Schema({
    room: { type: Schema.Types.ObjectId, ref: "GroupMessageRoom", required: true },
    from: { type: String, unique: false, required: true },
    message: { type: String, unique: false, required: true },
    time: { type: Date, unique: false, required: false, default: new Date() },
});

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
