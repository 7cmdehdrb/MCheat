var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", (req, res, next) => {
    const { session } = req;
    res.render("core/index", { session: session });
});

module.exports = router;
