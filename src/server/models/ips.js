import mongoose from "mongoose";
import paginator from "mongoose-paginate-v2";

const ipsSchema = new mongoose.Schema({
    ip: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function (v) {
                if (v == "192.168.0.1 ") {
                    return false;
                }
            },
        },
    },
});

ipsSchema.plugin(paginator);

export const IP = mongoose.model("IP", ipsSchema);

export let bannedIps = [];

export const getBannedIps = async () => {
    bannedIps = [];
    await IP.find()
        .exec()
        .then((ips) => {
            ips.forEach((ip) => {
                bannedIps.push(ip.ip);
            });
            console.log("GET BANNED IP SUCCESS");
        })
        .catch((err) => {
            console.log(err);
            console.log("GET BANNED IP FAIL");
        });
};
