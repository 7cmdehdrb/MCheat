import mongoose from "mongoose";
import paginator from "mongoose-paginate-v2";
import "./users";

const tagList = ["대리작", "파티", "사칭", "캐시", "물통", "계정", "기타"];

const checkTag = (tag) => {
    let result = tagList.indexOf(tag);
    return result !== -1;
};

const moneyType = ["메소", "원"];

const checkMoneyType = (type) => {
    let result = moneyType.indexOf(type);
    return result !== -1;
};

const bankList = [
    "KB국민은행",
    "우리은행",
    "신한은행",
    "하나은행",
    "카카오뱅크",
    "케이뱅크",
    "SC제일은행",
    "한국씨티은행",
    "BNK부산은행",
    "BNK경남은행",
    "광주은행",
    "DBG대구은행",
    "전북은행",
    "제주은행",
    "농협",
    "수협",
    "신협",
    "산림조합",
    "상호저축은행",
    "새마을금고",
    "기타",
];

const checkBankType = (type) => {
    let result = bankList.indexOf(type);
    return result !== -1;
};

const cheatSchema = new mongoose.Schema(
    {
        writerEmail: { type: String, unique: false, required: true },
        tag: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    return checkTag(v);
                },
            },
        },
        title: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    if (v.length > 30) {
                        return false;
                    }
                },
            },
        },
        date: { type: Date, unique: false, required: true },
        createdDate: { type: Date, unique: false, required: false, default: new Date() },
        subCharacter: { type: String, unique: false, required: true },
        mainCharacter: { type: String, unique: false, required: false },
        server: { type: String, unique: false, required: true },
        guild: { type: String, unique: false, required: true },
        farm: { type: String, unique: false, required: false },
        money: { type: Number, unique: false, required: true },
        money_type: {
            type: String,
            unique: false,
            required: true,
            validate: {
                validator: function (v) {
                    return checkMoneyType(v);
                },
            },
        },
        phone: {
            type: String,
            unique: false,
            required: false,
            validate: {
                validator: function (v) {
                    if (Boolean(Number(v))) {
                        return true;
                    } else {
                        return false;
                    }
                },
            },
        },
        account_type: {
            type: String,
            unique: false,
            required: false,
            validate: {
                validator: function (v) {
                    if (v == null) {
                        return true;
                    } else {
                        return checkBankType(v);
                    }
                },
            },
        },
        account: {
            type: String,
            unique: false,
            required: false,
            validate: {
                validator: function (v) {
                    if (v != null && v != "") {
                        if (v.length < 11) {
                            return false;
                        }
                        if (Boolean(Number(v))) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                },
            },
        },
        content: { type: String, unique: false, required: true },
        files: [{ type: String, unique: false, required: false }],
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

cheatSchema.virtual("writer", {
    ref: "User",
    localField: "writerEmail",
    foreignField: "email",
    justOne: true,
});

cheatSchema.plugin(paginator);

export const Cheat = mongoose.model("Cheat", cheatSchema);
