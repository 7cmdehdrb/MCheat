var express = require("express");
var router = express.Router();
import { Report } from "../models/report";
import { csrfProtection } from "../../middleware";
import sanitize from "mongo-sanitize";
import { User } from "../models/users";
import { Cheat } from "../models/cheat";

/* GET home page. */
router.get("/", async (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    let userCnt = 0;
    let cheatCnt = 0;
    let tradeCnt = 0;

    userCnt = await User.count()
        .exec()
        .catch((err) => {
            console.log(err);
        });

    cheatCnt = await Cheat.count()
        .exec()
        .catch((err) => {
            console.log(err);
        });

    const count = {
        user: userCnt,
        cheat: cheatCnt,
        trade: tradeCnt,
    };

    res.render("core/index", { session: session, count: count, show: show, message: message });
});

router.get("/report", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.send(`
            <script>
                window.close();
            </script>
        `);
        return;
    }

    res.render("core/report", { session: session, csrfToken: csrfToken, id: id });
});

router.post("/report", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id, title, url, check1, check2, check3, check4, check5, check6, check7, content } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    let catagories = [];

    if (check1) {
        catagories.push(check1);
    }

    if (check2) {
        catagories.push(check2);
    }

    if (check3) {
        catagories.push(check3);
    }

    if (check4) {
        catagories.push(check4);
    }

    if (check5) {
        catagories.push(check5);
    }

    if (check6) {
        catagories.push(check6);
    }

    if (check7) {
        catagories.push(check7);
    }

    await Report.create({
        writerEmail: session.user.email,
        id: sanitize(id),
        url: sanitize(url),
        title: sanitize(title),
        content: sanitize(content),
        catagory: catagories,
    }).catch((err) => {
        console.log(err);
    });

    res.send(`
        <script>
            window.close();
        </script>
    `);
});

module.exports = router;
