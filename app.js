import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import bodyParser from "body-parser";
import session from "express-session";
import ipblock from "express-ip-block";
import timeout from "express-timeout-handler";
import helmet from "helmet";
import flash from "connect-flash";
import admin from "sriracha";
const MongoStore = require("connect-mongo")(session);
import socketIo from "socket.io";
import socketEvent from "./socket";

import "./env";
import "./db";

import { bannedIps, getBannedIps } from "./server/models/ips";
import { rateLimitModule, timeoutModule } from "./middleware";

import indexRouter from "./server/routes/index";
import usersRouter from "./server/routes/users";
import adminRouter from "./server/routes/admin";
import communityRouter from "./server/routes/community";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "server/views"));
app.set("view engine", "ejs");

// Security

// time-out-handle
app.use(timeoutModule);
//  D-Dos block
app.use(rateLimitModule);
// helmet
app.use(helmet());
// ip block
getBannedIps();
app.use(ipblock(bannedIps, { allow: false, allowForwarded: true }), timeout.set(5000), (req, res, next) => {
    next();
});

app.use(logger(process.env.DEBUG == "true" ? "dev" : "common"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(
    session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
            url: process.env.DB,
            collection: "sessions",
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 12, // 쿠키 유효기간 12시간
            httpOnly: true,
        },
    })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

app.use(function (err, req, res, next) {
    console.log(err);
    if (err.code !== "EBADCSRFTOKEN") return next(err);

    // handle CSRF token errors here
    res.status(403);
    res.send("form tampered with");
});

// URL Pattern

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
    res.locals.error = process.env.DEBUG == "true" ? err : {};

    // render the error page
    res.status(err.status || 500).render("error/error");
});

app.set("port", process.env.PORT || process.env.PORT);

const server = app.listen(app.get("port"), function () {
    console.log(`SERVER START AT http://localhost:${server.address().port}/`);
});

const io = socketIo(server);
socketEvent(io);

module.exports = app;
