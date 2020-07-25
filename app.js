import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import flash from "connect-flash";
import admin from "sriracha";
import rateLimit from "express-rate-limit";
import ipblock from "express-ip-block";
import helmet from "helmet";

import "./env";
import "./db";

import { bannedIps, getBannedIps } from "./server/models/ips";

import indexRouter from "./server/routes/index";
import usersRouter from "./server/routes/users";
import adminRouter from "./server/routes/admin";
import communityRouter from "./server/routes/community";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "server/views"));
app.set("view engine", "ejs");

getBannedIps();

app.use(ipblock(bannedIps, { allow: false, allowForwarded: true }), (req, res, next) => {
    next();
});
app.use(
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1min
        max: 10 * 100,
    })
);

app.use(logger("common"));
// app.use(logger(" dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 24000 * 60 * 60, // 쿠키 유효기간 24시간
        },
    })
);
app.use(flash());
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use(
    "/express-admin",
    admin({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        User: {
            searchField: "email",
        },
    })
);
app.use("/users", usersRouter);
app.use("/communities", communityRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error/error");
});

app.set("port", process.env.PORT || process.env.PORT);

const server = app.listen(app.get("port"), function () {
    console.log(`SERVER START AT http://localhost:${server.address().port}/`);
});

module.exports = app;
