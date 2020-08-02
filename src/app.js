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
import compression from "compression";
import flash from "connect-flash";
import socketIo from "socket.io";
import socketEvent from "./socket";
const MongoStore = require("connect-mongo")(session);

import "./env";
import "./db";

import { bannedIps, getBannedIps } from "./server/models/ips";
import { rateLimitModule, timeoutModule } from "./middleware";

import indexRouter from "./server/routes/index";
import usersRouter from "./server/routes/user";
import communityRouter from "./server/routes/community";
import messageRouter from "./server/routes/message";
import cheatRouter from "./server/routes/cheat";
import adminRouter from "./server/routes/admin";
import mongoAdminRouter from "sriracha";

const adminOpt = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
};

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
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(process.env.SESSION_SECRET));

app.use(
    session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            url: process.env.DB,
            collection: "sessions",
        }),
        cookie: {
            maxAge: 1000 * 60 * 60, // 쿠키 유효기간 1시간
            httpOnly: true,
        },
    })
);

app.use(flash());
app.use(express.static(path.join(__dirname, "public"), { maxAge: process.env.DEBUG == "true" ? 0 : 1000 * 60 * 60 }));

// URL Pattern

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/communities", communityRouter);
app.use("/messages", messageRouter);
app.use("/cheat", cheatRouter);
app.use("/admin", adminRouter);
app.use(
    "/express-admin",
    (req, res, next) => {
        req.session.destroy();
        next();
    },
    mongoAdminRouter(adminOpt)
);

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
