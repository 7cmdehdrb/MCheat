var express = require("express");
var router = express.Router();
import { InstantMessage } from "../models/messages";

router.get("/", (req, res, next) => {
    res.redirect("/");
});

router.get("/instantMessage", async (req, res, next) => {
    const { session } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const myMessages = await InstantMessage.find({
        $or: [
            {
                to: {
                    $eq: session.user.nickname,
                },
            },
            {
                from: {
                    $eq: session.user.nickname,
                },
            },
        ],
    })
        // .limit(100)
        .sort("time")
        .exec()
        .catch((err) => {
            console.log(err);
        });

    res.render("message/instantMessage", { session: session, messages: myMessages });
});

module.exports = router;
