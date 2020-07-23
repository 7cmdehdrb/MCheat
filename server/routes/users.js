var express = require("express");
var router = express.Router();
import { userModel } from "../models/users";
import { getGuild, hashFunction, createUUID, sendMail, sendResetMail } from "../../utils";

/* GET users listing. */
router.get("/", async (req, res, next) => {
    const allUser = await userModel.deleteOne().where("email").equals("7cmdehdrb@naver.com");
    // const allUser = await userModel.find().exec();
    res.json(allUser);
});

router.get("/login", (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    if (session.user) {
        res.redirect("/users/logout");
    }
    res.render("user/login", { session: session, show: show, message: message });
});

router.post("/login", async (req, res, next) => {
    const { session } = req;
    const { email, password } = req.body;

    // const user = await userModel.findOne().where("email").equals(email).where("password").equals(hashFunction(password)).select("email nickname server guild farm email_valid is_admin is_activated");

    const user = await userModel
        .findOne({
            $and: [{ email: email }, { password: hashFunction(password) }],
        })
        .exec();

    if (user !== null) {
        if (user.email_valid == false) {
            req.flash("show", true);
            req.flash("message", "이메일 인증을 진행해주세요");
            res.redirect("/users/login");
            return;
        }
        if (user.is_activated == false) {
            req.flash("show", true);
            req.flash("message", "비활성화된 계정입니다 관리자에게 문의해주세요");
            res.redirect("/users/login");
            return;
        }
        session.user = user;
        session.save(() => {
            res.redirect("/");
        });
    } else {
        req.flash("show", "true");
        req.flash("message", "로그인에 실패했습니다");
        res.redirect("/users/login");
    }
});

router.get("/logout", (req, res, next) => {
    const { session } = req;
    if (!session.user) {
        res.redirect("/users/login");
        return;
    }
    session.user = null;
    session.save(() => {
        res.redirect("/");
    });
});

router.get("/signup", (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    if (session.user) {
        res.redirect("user/logout");
    }
    res.render("user/signup", { session: session, show: show, message: message });
});

router.post("/signup", async (req, res, next) => {
    const { email, password, nickname, server, guild, farm, profile } = req.body;

    await userModel
        .create({
            email,
            password: hashFunction(password),
            nickname,
            server,
            guild,
            farm,
            profile,
            email_secret: createUUID(),
            email_valid: false,
            is_admin: false,
            is_activated: true,
        })
        .then((user) => {
            sendMail(user.email, user.email_secret);
            req.flash("show", true);
            req.flash("message", "회원가입에 성공하였습니다! 이메일 인증을 진행하고 로그인해주세요");
            res.redirect("/users/login");
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", true);
            req.flash("message", "회원가입에 실패하였습니다. 이 오류가 지속되면 관리자에게 문의해주세요");
            res.redirect("/users/signup");
        });
});

router.get("/userProfile", async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;

    const show = req.flash("show");
    const message = req.flash("message");

    let targetUser;

    if (!id) {
        if (!session.user) {
            res.redirect("/");
        } else {
            targetUser = await userModel
                .findOne({
                    email: session.user.email,
                })
                .exec();
        }
    } else {
        targetUser = await userModel
            .findOne({
                email: id,
            })
            .exec();

        if (targetUser === null) {
            res.redirect("/");
            return;
        }
    }

    res.render("user/detail", { session: session, user: targetUser, show: show, message: message });
});

router.get("/editProfile", (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    if (!session.user) {
        res.redirect("/users/login");
    } else {
        res.render("user/editProfile", { session: session, show: show, message: message });
    }
});

router.post("/editProfile", async (req, res, next) => {
    const { session } = req;
    const { farm, nickname, server, guild, profile, bio } = req.body;

    await userModel
        .updateOne(
            {
                email: session.user.email,
            },
            {
                $set: {
                    nickname,
                    server,
                    guild,
                    farm,
                    profile,
                    bio,
                },
            }
        )
        .then(() => {
            req.flash("show", "true");
            req.flash("message", "정보를 변경했습니다");
            res.redirect("/users/userProfile");
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "정보를 변경할 수 없습니다. 이미 사용중인 캐릭터일 수 있습니다");
            res.redirect("/users/editProfile");
        });
});

router.get("/changePassword", (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    res.render("user/changePassword", { session: session, show: show, message: message });
});

router.post("/changePassword", async (req, res, next) => {
    const { session } = req;
    const { current_password, password } = req.body;

    if (session.user) {
        await userModel
            .update(
                {
                    $and: [
                        {
                            email: session.user.email,
                        },
                        {
                            password: hashFunction(current_password),
                        },
                    ],
                },
                {
                    $set: {
                        password: hashFunction(password),
                    },
                }
            )
            .then((user) => {
                req.flash("show", "true");
                if (user.nModified == 0) {
                    req.flash("message", "정보를 변경할 수 없습니다");
                    res.redirect("/users/changePassword");
                } else {
                    req.flash("message", "정보를 변경했습니다");
                    res.redirect("/users/userProfile");
                }
            })
            .catch((err) => {
                console.log(err);
                req.flash("show", "true");
                req.flash("message", "정보를 변경할 수 없습니다");
                res.redirect("/users/editProfile");
            });
    }
});

router.get("/findPassword", (req, res, next) => {
    const { session } = req;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    res.render("user/findPassword", { session: session });
});

router.post("/findPassword", async (req, res, next) => {
    const { email, nickname } = req.body;

    const targetUser = await userModel.findOne().where("email").equals(email).where("nickname").equals(nickname).select("email").exec();

    if (targetUser === null) {
        req.flash("show", "true");
        req.flash("message", "해당 사용자를 찾을 수 없습니다");
        res.redirect("/users/findPassword");
    } else {
        const newSecret = createUUID();
        const updatedUser = await userModel.updateOne(
            {
                email: email,
                nickname: nickname,
                email_valid: true,
                email_secret: null,
            },
            {
                $set: {
                    email_secret: newSecret,
                },
            }
        );

        req.flash("show", "true");

        if (updatedUser.nModified == 1) {
            sendResetMail(targetUser.email, newSecret);
            req.flash("message", "이메일을 확인해주세요");
        } else {
            req.flash("message", "최초 인증을 진행하지 않은 사용자입니다");
        }
        res.redirect("/users/login");
    }
});

// BACK

router.get("/resetPassword", async (req, res, next) => {
    const { secret } = req.query;

    console.log(secret);

    const test = await userModel.findOne().where("email_valid").equals(true).where("email_secret").equals(secret).exec();

    console.log(test);

    const updatedUser = await userModel.updateOne(
        {
            email_valid: true,
            email_secret: secret,
        },
        {
            $set: {
                email_secret: null,
                password: hashFunction("0000"),
            },
        }
    );

    console.log(updatedUser);

    req.flash("show", "true");
    if (updatedUser.nModified == 1) {
        req.flash("message", "비밀번호가 성공적으로 초기화되었습니다");
    } else {
        req.flash("message", "비밀번호 초기화에 실패하였습니다");
    }

    res.redirect("/users/login");
});

router.get("/verifyEmail", async (req, res, next) => {
    const { secret } = req.query;

    const updatedUser = await userModel.updateOne(
        {
            email_valid: false,
            email_secret: secret,
        },
        {
            $set: {
                email_valid: true,
                email_secret: null,
            },
        }
    );

    req.flash("show", "true");
    if (updatedUser.nModified == 1) {
        req.flash("message", "인증에 성공하였습니다!");
    } else {
        req.flash("message", "인증에 실패하였습니다");
    }

    res.redirect("/users/login");
});

router.get("/searchNickname", async (req, res, next) => {
    const { id } = req.query;

    const { guild, server, profile } = await getGuild(id);

    res.json({
        guild: guild,
        server: server,
        profile: profile,
    });
});

module.exports = router;
