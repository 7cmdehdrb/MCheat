import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import "./users";

const tagList = ["자유", "정보", "모임", "건의", "공지"];

const checkTagValid = (tag) => {
    let result = tagList.indexOf(tag);
    return result !== -1;
};

const commnetSchema = new mongoose.Schema(
    {
        writerEmail: { type: String, unique: false, required: true },
        noticeId: { type: String, unique: false, required: true },
        content: { type: String, unique: false, required: true },
        time: { type: Date, unique: false, required: false, default: new Date() },
        is_deleted: { type: Boolean, unique: false, required: false, default: false },
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

commnetSchema.virtual("writer", {
    ref: "User",
    localField: "writerEmail",
    foreignField: "email",
    justOne: true,
});

export const Comment = mongoose.model("Comment", commnetSchema);

const communitySchema = new mongoose.Schema(
    {
        writerEmail: { type: String, unique: false, required: true },
        tag: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    return checkTagValid(v);
                },
                message: (props) => `${props.value} is not valid tag name`,
            },
        },
        title: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    return v.length < 21;
                },
                message: () => "Title is too long",
            },
        },
        content: { type: String, unique: false, required: true },
        file: { type: String, unique: false, required: false },
        time: { type: Date, unique: false, required: false, default: new Date() },
        recommends: [
            {
                recommender: { type: String, unique: false, required: false },
                like: { type: Boolean, unique: false, required: false, default: true },
            },
        ],
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

communitySchema.virtual("writer", {
    ref: "User",
    localField: "writerEmail",
    foreignField: "email",
    justOne: true,
});

communitySchema.plugin(mongoosePaginate);

export const Community = mongoose.model("Community", communitySchema);
