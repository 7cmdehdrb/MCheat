import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import session from "express-session";
import flash from "connect-flash";

import "./env";
import "./db";

import indexRouter from "./server/routes/index";
import usersRouter from "./server/routes/users";
import adminRouter from "./server/routes/admin";

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "server/views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
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
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

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
