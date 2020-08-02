import "./env";
import crypto from "crypto";
const axios = require("axios");
const cheerio = require("cheerio");
const mailgun = require("mailgun-js")({
    apiKey: process.env.MAILGUN_KEY,
    domain: process.env.MAILGUN_DOMAIN,
});
import { emailVerification, passwordReset } from "./emails";

const getWorld = (icon) => {
    const url = "https://ssl.nx.com/s2/game/maplestory/renewal/common/world_icon/";
    let world;

    try {
        world = icon.replace(url, "").replace(".png", "").replace("icon_", "");
    } finally {
        switch (world) {
            case "2":
                return "리부트2";
            case "3":
                return "리부트";
            case "4":
                return "오로라";
            case "5":
                return "레드";
            case "6":
                return "이노시스";
            case "7":
                return "유니온";
            case "8":
                return "스카니아";
            case "9":
                return "루나";
            case "10":
                return "제니스";
            case "11":
                return "크로아";
            case "12":
                return "베라";
            case "13":
                return "엘리시움";
            case "14":
                return "아케인";
            case "15":
                return "노바";
            default:
                return "캐릭터를 찾을 수 없습니다";
        }
    }
};

export const getTag = (tag) => {
    switch (tag) {
        case "free":
            return "자유";
        case "info":
            return "정보";
        case "group":
            return "모임";
        case "request":
            return "건의";
        default:
            return null;
    }
};

export const getGuild = async (nickname) => {
    let result;
    const encodedNickname = encodeURI(nickname);
    try {
        result = await axios
            .get(`https://maplestory.nexon.com/Ranking/World/Total?c=${encodedNickname}`)
            .then((html) => {
                let $ = cheerio.load(html.data);
                let $bodyList = $("tr.search_com_chk").children("td");

                let guilds = [];
                let servers = [];

                $("tr.search_com_chk")
                    .find("img")
                    .each((i, elem) => {
                        servers.push(elem.attribs.src);
                    });

                $bodyList.each((i, elem) => {
                    const { children } = elem;
                    children.forEach((element) => {
                        guilds.push(element.data);
                    });
                });

                return { guild: guilds[13] !== undefined ? guilds[13] : "길드없음", server: getWorld(servers[5]), profile: servers[3] };
            })
            .catch((err) => {
                console.log("ERROR!" + err);
                return { guild: "캐릭터를 찾을 수 없습니다", server: "캐릭터를 찾을 수 없습니다" };
            });
    } catch (error) {
        console.error(error);
    }

    return result;
};

export const hashFunction = (password) => {
    const encodedPw = crypto
        .createHash("sha512")
        .update(password + process.env.HASH)
        .digest("hex");
    return encodedPw;
};

function s4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function guid() {
    return s4() + s4() + s4() + s4() + s4();
}

export const createUUID = () => {
    return guid();
};

export const newDatetimeFormat = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth() + 1 < 10 ? "0" + today.getMonth() + 1 : today.getMonth() + 1;
    const date = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
    const hour = today.getHours() < 10 ? "0" + today.getHours() : today.getHours();
    const minute = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const second = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();

    return `${year}${month}${date}${hour}${minute}${second}`;
};

export const datetimeToString = (date) => {
    const month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
    const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return `${month}${day}`;
};

export const getPlaneString = (str) => {
    return str.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, "");
};

export const phone_transfer = (phone) => {
    const phone_divide = phone.split("");
    const new_phone = `${phone_divide[0]}${phone_divide[1]}${phone_divide[2]}-****-${phone_divide[7]}${phone_divide[8]}${phone_divide[9]}${phone_divide[10]}`;

    return new_phone;
};

export const account_transfer = (account) => {
    let new_account = "";
    const account_divide = account.split("");

    for (let index = 0; index < account_divide.length; index++) {
        if (index >= account_divide.length - 5) {
            new_account += account_divide[index];
        } else if (index < 3) {
            new_account += account_divide[index];
        } else {
            new_account += "*";
        }
    }

    return new_account;
};

export const date_transfer = (data) => {
    const newDate = new Date(data);
    const year = newDate.getFullYear();
    let month = newDate.getMonth() + 1;
    if (month < 10) {
        month = "0" + month;
    }
    let date = newDate.getDate();
    if (date < 10) {
        date = "0" + date;
    }
    const newDateFormat = `${year}-${month}-${date}`;
    return newDateFormat;
};

export const sendMail = (address, secret) => {
    const data = {
        from: "MCheat@mcheat.ga",
        to: address,
        subject: "MCheat 이메일 인증",
        html: emailVerification(secret),
    };

    mailgun.messages().send(data, function (err, body) {
        if (err) console.log(err);

        console.log(body);
    });
};

export const sendResetMail = (address, secret) => {
    const data = {
        from: "MCheat@mcheat.ga",
        to: address,
        subject: "MCheat 비밀번호 초기화",
        html: passwordReset(secret),
    };

    mailgun.messages().send(data, function (err, body) {
        if (err) console.log(err);

        console.log(body);
    });
};
