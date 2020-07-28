import mongoose from "mongoose";
import "./users";

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
