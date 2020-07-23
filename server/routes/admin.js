var express = require("express");
var router = express.Router();
const { userModel } = require("../models/users");

router.get("/", (req, res, next) => {
    const { session } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    res.send("ADMIN");
});

router.get("/allUsers", async (req, res, next) => {
    const { session } = req;
    const { page } = req.query;

    // if (!session.user) {
    //     res.redirect("/users/login");
    //     return;
    // }

    // if (session.user.is_admin == false) {
    //     req.flash("show", "true");
    //     req.flash("message", "관리자 전용 기능입니다");
    //     res.redirect("/");
    //     return;
    // }

    await userModel
        .paginate(
            {},
            {
                page: page || 1,
                limit: 15,
            },
            {}
        )
        .then((users) => {
            res.render("user/allusers", { session: session, users: users.docs, current_page: users.page, all_page: users.totalPages });
            console.log(users);
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류");
            res.redirect("/");
        });
});

module.exports = router;
