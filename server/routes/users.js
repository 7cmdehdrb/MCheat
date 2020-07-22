var express = require("express");
var router = express.Router();
import { userModel } from "../models/users";
import { getGuild, hashFunction } from "../../utils";

/* GET users listing. */
router.get("/", async (req, res, next) => {
    res.redirect("/");
});

router.get("/login", (req, res, next) => {
    const { session } = req;
    if (session.user) {
        res.redirect("user/logout");
    }
    res.render("user/login", { session: session });
});

router.post("/login", async (req, res, next) => {
    const { session } = req;
    const { email, password } = req.body;

    const user = await userModel.findOne().where("email").equals(email).where("password").equals(hashFunction(password)).select("email nickname server guild farm");

    console.log(user);

    if (user !== null) {
        session.user = user;
        session.save(() => {
            res.redirect("/");
        });
    } else {
        res.send(`
        <script>
            alert('로그인에 실패했습니다. 이메일이나 비밀번호를 확인해주세요')
            history.back()
        </script>
    `);
    }
});

router.get("/logout", (req, res, next) => {
    const { session } = req;
    if (!session) {
        res.redirect("user/login");
    } else {
        session.user = null;
        session.save(() => {
            res.redirect("/");
        });
    }
});

router.get("/signup", (req, res, next) => {
    const { session } = req;
    if (session.user) {
        res.redirect("user/logout");
    }
    res.render("user/signup", { session: session });
});

router.post("/signup", async (req, res, next) => {
    const { email, password, nickname, server, guild, farm } = req.body;

    await userModel
        .create({
            email,
            password: hashFunction(password),
            nickname,
            server,
            guild,
            farm,
        })
        .then((user) => {
            console.log(user);
            res.redirect("/users/login");
        })
        .catch((err) => {
            console.log(err);
            res.send(`
            <script>
                alert('이미 가입한 유저입니다! 본인이 가입하지 않았다면 관리자에게 문의해주십시오')
                history.back()
            </script>
        `);
        });
});

router.get("/searchNickname", async (req, res, next) => {
    const { id } = req.query;

    const { guild, server } = await getGuild(id);

    res.json({
        guild: guild,
        server: server,
    });
});

module.exports = router;
