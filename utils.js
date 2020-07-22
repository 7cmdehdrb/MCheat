import crypto from "crypto";
import "./env";
const axios = require("axios");
const cheerio = require("cheerio");

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

                getWorld(servers[5]);

                return { guild: guilds[13] !== undefined ? guilds[13] : "길드없음", server: getWorld(servers[5]) };
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
