var express = require("express");
var router = express.Router();
import { Cheat } from "../models/cheat";
import sanitize from "mongo-sanitize";
import { csrfProtection } from "../../middleware";
import { getPlaneString, phone_transfer, account_transfer } from "../../utils";
import { cheatUpload } from "../../multer";

// 검색

router.get("/search", async (req, res, next) => {
    const { session } = req;
    let { search, page } = req.query;

    if (!page) {
        page = 1;
    }

    if (!search) {
        req.flash("show", "true");
        req.flash("message", "올바르지 않은 접근입니다");
        res.redirect("/");
        return;
    }

    search = getPlaneString(search);
    let totalPages = 1;

    const charQuery = {
        $or: [
            {
                subCharacter: {
                    $regex: `.*${sanitize(search)}.*`,
                },
            },
            {
                mainCharacter: {
                    $regex: `.*${sanitize(search)}.*`,
                },
            },
            {
                farm: {
                    $regex: `.*${sanitize(search)}.*`,
                },
            },
        ],
    };

    let byCharacter = await Cheat.paginate(charQuery, {
        page: page || 1,
        limit: 50,
        select: "_id subCharacter mainCharacter farm writerEmail",
        sort: "-createdDate",
        populate: {
            path: "writer",
            model: "User",
            select: "_id nickname email",
        },
    }).then((characters) => {
        characters.docs = characters.docs.filter((element) => element.writer != null);
        totalPages = characters.totalPages;
        return characters.docs;
    });

    const phoneQuery = {
        phone: {
            $regex: `.*${sanitize(search)}.*`,
        },
    };

    let byPhone = await Cheat.paginate(phoneQuery, {
        page: page || 1,
        limit: 50,
        select: "_id phone writerEmail",
        sort: "-createdDate",
        populate: {
            path: "writer",
            model: "User",
            select: "_id nickname email",
        },
    })
        .then((phones) => {
            phones.docs = phones.docs.filter((element) => element.writer != null);
            if (phones.totalPages > totalPages) {
                totalPages = phones.totalPages;
            }
            return phones.docs;
        })
        .catch((err) => {
            console.log(err);
        });

    byPhone.forEach((phone) => {
        let temp = phone;
        temp.phone = phone_transfer(phone.phone);
    });

    const accountQuery = {
        account: {
            $regex: `.*${sanitize(search)}.*`,
        },
    };

    let byAccout = await Cheat.paginate(accountQuery, {
        page: page || 1,
        limit: 50,
        select: "_id account account_type writerEmail",
        sort: "-createdDate",
        populate: {
            path: "writer",
            model: "User",
            select: "_id nickname email",
        },
    })
        .then((accounts) => {
            accounts.docs = accounts.docs.filter((element) => element.writer != null);
            if (accounts.totalPages > totalPages) {
                totalPages = accounts.totalPages;
            }
            return accounts.docs;
        })
        .catch((err) => {
            console.log(err);
        });

    byAccout.forEach((account) => {
        let temp = account;
        temp.account = account_transfer(account.account);
    });

    res.render("cheat/searchCheat", { session: session, character: byCharacter, account: byAccout, phone: byPhone, page: page, totalPages: totalPages });
});

// 새 사기 등록

router.get("/newCheat", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    res.render("cheat/newCheat", { session: session, csrfToken: csrfToken });
});

router.post("/newCheat", cheatUpload.array("images"), csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { tag, date, title, money, money_type, nickname, main_nickname, server, guild, farm, content, phone, account_type, account } = req.body;
    const { files } = req;

    let filenames = [];

    files.forEach((element) => {
        filenames.push(element.location);
    });

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await Cheat.create({
        writerEmail: session.user.email,
        tag: sanitize(tag),
        title: sanitize(title),
        date: sanitize(date),
        subCharacter: sanitize(nickname),
        mainCharacter: Boolean(main_nickname) ? sanitize(main_nickname) : null,
        server: sanitize(server),
        guild: sanitize(guild),
        farm: Boolean(farm) ? sanitize(farm) : null,
        money: money,
        phone: Boolean(phone) ? sanitize(phone.replace(/-/gi, "")) : null,
        account_type: account_type == "NOBANK" ? null : sanitize(account_type),
        account: Boolean(account) ? sanitize(account.replace(/-/gi, "")) : null,
        money_type: sanitize(money_type),
        content: sanitize(content),
        files: filenames,
    })
        .then((newCheat) => {
            if (newCheat == null) {
                throw Error();
            }
            res.redirect(`/cheat/detail?id=${newCheat._id}`); // 목록으로 리다이렉트
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "등록에 실패하였습니다");
            res.redirect("/");
        });
});

// 사기 내용 디테일

router.get("/detail", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    const cheatDetail = await Cheat.findOne({
        _id: sanitize(id),
    })
        .populate(
            "writer",
            `
            email
            nickname
        `
        )
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (cheatDetail == null) {
        req.flash("show", "true");
        req.flash("message", "정보를 불러올 수 없습니다");
        res.redirect("/");
        return;
    } else if (cheatDetail.writer == null) {
        req.flash("show", "true");
        req.flash("message", "삭제된 유저입니다");
        res.redirect("/");
        return;
    }

    if (cheatDetail.account) {
        cheatDetail.account = account_transfer(cheatDetail.account);
    }
    if (cheatDetail.phone) {
        cheatDetail.phone = phone_transfer(cheatDetail.phone);
    }

    res.render("cheat/detail", { session: session, detail: cheatDetail, id: id, csrfToken: csrfToken });
});

module.exports = router;

// 사기 리스트

// router.get("/cheatList", async (req, res, next) => {
//     const { session } = req;
//     const { page } = req.query;

//     const show = req.flash("show");
//     const message = req.flash("message");

//     const query = {};

//     await Cheat.paginate(query, {
//         select: `
//             writerEmail
//             tag
//             title
//             subCharacter
//             mainCharacter
//             server
//             date
//             `,
//         page: page || 1,
//         limit: 20,
//         sort: "-createdDate",
//         populate: {
//             path: "writer",
//             select: `
//             _id
//             email
//             nickname
//             server
//             `,
//             model: "User",
//         },
//     })
//         .then((cheats) => {
//             cheats.docs = cheats.docs.filter((element) => element.writer != null);
//             if (page > cheats.totalPages) {
//                 res.redirect(`/?page=${cheats.totalPages}`);
//             } else {
//                 res.render("", { session: session, cheats: cheats, show: show, message: message });
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//             req.flash("show", "true");
//             req.flash("message", "목록을 불러오는데 실패했습니다");
//             res.redirect("/");
//         });
// });
