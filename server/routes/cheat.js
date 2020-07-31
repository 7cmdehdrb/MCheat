var express = require("express");
var router = express.Router();
import { Cheat } from "../models/cheat";
import sanitize from "mongo-sanitize";
import { csrfProtection } from "../../middleware";
import { cheatUpload } from "../../multer";

// 사기 리스트

router.get("/cheatList", async (req, res, next) => {
    const { session } = req;
    const { page } = req.query;

    const show = req.flash("show");
    const message = req.flash("message");

    let query = {};

    await Cheat.paginate(query, {
        select: `
            writerEmail
            tag
            title
            subCharacter
            mainCharacter
            server
            date
            `,
        page: page || 1,
        limit: 20,
        sort: "-createdDate",
        populate: {
            path: "writer",
            select: `
            _id
            email
            nickname
            server
            `,
            model: "User",
        },
    })
        .then((cheats) => {
            if (page > cheats.totalPages) {
                res.redirect(`/cheat/cheatList?page=${cheats.totalPages}`);
            } else {
                res.render("cheat/cheatList", { session: session, cheats: cheats, show: show, message: message });
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "목록을 불러오는데 실패했습니다");
            res.redirect("/");
        });
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
        filenames.push(element.filename);
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
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "등록에 실패하였습니다");
        });

    res.redirect("/cheat/cheatList"); // 목록으로 리다이렉트
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
        res.redirect("/cheat/cheatList");
        return;
    }

    res.render("cheat/detail", { session: session, detail: cheatDetail, id: id, csrfToken: csrfToken });
});

module.exports = router;
