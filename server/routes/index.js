var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("core/index", { session: session, show: show, message: message });
});

module.exports = router;
