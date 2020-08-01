import mongoose from "mongoose";
import paginator from "mongoose-paginate-v2";
import "./users";

const reportSchema = new mongoose.Schema(
    {
        writerEmail: { type: String, unique: false, required: true },
        id: { type: String, unique: false, required: true },
        url: { type: String, unique: false, required: true },
        title: { type: String, unique: false, required: true },
        content: { type: String, unique: false, required: true },
        date: { type: Date, unique: false, required: false, default: new Date() },
        catagory: [{ type: String, unique: false, required: true }],
        is_finished: { type: Boolean, unique: false, required: true, default: false },
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

reportSchema.virtual("writer", {
    ref: "User",
    localField: "writerEmail",
    foreignField: "email",
    justOne: true,
});

reportSchema.plugin(paginator);

export const Report = mongoose.model("Report", reportSchema);
