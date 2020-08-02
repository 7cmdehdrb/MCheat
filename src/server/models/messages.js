import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import "./users";

const instantMessageSchema = new mongoose.Schema(
    {
        to: { type: String, unique: false, required: true },
        from: { type: String, unique: false, required: true },
        from_email: { type: String, unique: false, required: true },
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

instantMessageSchema.virtual("fromUser", {
    ref: "User",
    localField: "from_email",
    foreignField: "email",
    justOne: true,
});

export const InstantMessage = mongoose.model("InstantMessage", instantMessageSchema);

const groupMessageRoomSchema = new mongoose.Schema(
    {
        name: { type: String, unique: false, required: true },
        password: { type: String, unique: false, required: true },
        introduce: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    return v.length <= 300;
                },
            },
        },
        masterEmail: { type: String, unique: false, required: true },
        roomMember: [
            {
                user: { type: String, unique: false, required: true },
            },
        ],
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

groupMessageRoomSchema.virtual("master", {
    ref: "User",
    localField: "masterEmail",
    foreignField: "email",
    justOne: true,
});

groupMessageRoomSchema.virtual("member", {
    ref: "User",
    localField: "roomMember.user",
    foreignField: "email",
    justOne: true,
});

groupMessageRoomSchema.plugin(mongoosePaginate);

export const GroupMessageRoom = mongoose.model("GroupMessageRoom", groupMessageRoomSchema);

const groupMessageSchema = new mongoose.Schema(
    {
        room: { type: Schema.Types.ObjectId, ref: "GroupMessageRoom", required: true },
        from: { type: String, unique: false, required: true },
        from_email: { type: String, unique: false, required: true },
        message: { type: String, unique: false, required: true },
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

groupMessageSchema.virtual("user", {
    ref: "User",
    localField: "from_email",
    foreignField: "email",
    justOne: true,
});

export const GroupMessage = mongoose.model("GroupMessage", groupMessageSchema);
