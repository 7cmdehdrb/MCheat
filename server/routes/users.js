var express = require("express");
var router = express.Router();
import sanitize from "mongo-sanitize";
import { userModel } from "../models/users";
import { getGuild, hashFunction, createUUID, sendMail, sendResetMail } from "../../utils";

/* GET users listing. */
router.get("/", async (req, res, next) => {
    const allUser = await userModel.find().exec();
    console.log(allUser);
    res.redirect("/");
});

router.get("/login", (req, res, next) => {
    const { session } = req;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/login", { session: session, show: show, message: message });
});

router.post("/login", async (req, res, next) => {
    const { session } = req;
    const { email, password } = req.body;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    const user = await userModel
        .findOne({
            $and: [{ email: sanitize(email) }, { password: hashFunction(sanitize(password)) }],
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

    if (session.user) {
        res.redirect("user/logout");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/signup", { session: session, show: show, message: message });
});

router.post("/signup", async (req, res, next) => {
    const { session } = req;
    const { email, password, nickname, server, guild, farm, profile } = req.body;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await userModel
        .create({
            email: sanitize(email),
            password: sanitize(hashFunction(password)),
            nickname: sanitize(nickname),
            server: sanitize(server),
            guild: sanitize(guild),
            farm: sanitize(farm),
            profile: sanitize(profile),
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

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    let targetUser;

    if (!id) {
        targetUser = await userModel
            .findOne({
                email: session.user.email,
            })
            .exec()
            .catch((err) => {
                console.log(err);
                res.redirect("/");
            });
    } else {
        targetUser = await userModel
            .findOne({
                email: sanitize(id),
            })
            .exec()
            .catch((err) => {
                console.log(err);
                res.redirect("/");
            });
    }

    if (targetUser === null) {
        res.redirect("/");
        return;
    }

    res.render("user/detail", { session: session, user: targetUser, show: show, message: message });
});

router.get("/editProfile", async (req, res, next) => {
    const { session } = req;

    const show = req.flash("show");
    const message = req.flash("message");

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const defaultUser = await userModel
        .findOne({
            email: session.user.email,
        })
        .exec()
        .catch((err) => {
            console.log(err);
            res.redirect("/");
            return;
        });

    res.render("user/editProfile", { session: session, defaultUser: defaultUser, show: show, message: message });
});

router.post("/editProfile", async (req, res, next) => {
    const { session } = req;
    const { farm, nickname, server, guild, profile, bio } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await userModel
        .updateOne(
            {
                email: session.user.email,
            },
            {
                $set: {
                    nickname: sanitize(nickname),
                    server: sanitize(server),
                    guild: sanitize(guild),
                    farm: sanitize(farm),
                    profile: sanitize(profile),
                    bio: sanitize(bio),
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

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/changePassword", { session: session, show: show, message: message });
});

router.post("/changePassword", async (req, res, next) => {
    const { session } = req;
    const { current_password, password } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await userModel
        .update(
            {
                $and: [
                    {
                        email: session.user.email,
                    },
                    {
                        password: sanitize(hashFunction(current_password)),
                    },
                ],
            },
            {
                $set: {
                    password: sanitize(hashFunction(password)),
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
    const { session } = req;
    const { email, nickname } = req.body;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await userModel
        .findOne({
            $and: [
                {
                    email: sanitize(email),
                },
                {
                    nickname: sanitize(nickname),
                },
            ],
        })
        .exec()
        .then((targetUser) => {
            if (targetUser === null) {
                req.flash("show", "true");
                req.flash("message", "해당 사용자를 찾을 수 없습니다");
                res.redirect("/users/findPassword");
            } else {
                const newSecret = createUUID();
                userModel
                    .updateOne(
                        {
                            $and: [
                                {
                                    email: sanitize(email),
                                },
                                {
                                    nickname: sanitize(nickname),
                                },
                                {
                                    email_valid: true,
                                },
                                {
                                    email_secret: null,
                                },
                            ],
                        },
                        {
                            $set: {
                                email_secret: newSecret,
                            },
                        }
                    )
                    .then((updatedUser) => {
                        if (updatedUser.nModified == 1) {
                            sendResetMail(targetUser.email, newSecret);
                            req.flash("show", "true");
                            req.flash("message", "이메일을 확인해주세요");
                            res.redirect("/users/login");
                        } else {
                            throw Error();
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/users/findPassword");
        });
});

// BACK

router.get("/resetPassword", async (req, res, next) => {
    const { session } = req;
    const { secret } = req.query;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await userModel
        .updateOne(
            {
                $and: [
                    {
                        email_valid: true,
                    },
                    {
                        email_secret: sanitize(secret),
                    },
                ],
            },
            {
                $set: {
                    email_secret: null,
                    password: hashFunction("0000"),
                },
            }
        )
        .then((updatedUser) => {
            if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "비밀번호가 성공적으로 초기화되었습니다");
            } else {
                req.flash("show", "true");
                req.flash("message", "비밀번호 초기화에 실패하였습니다");
            }
            res.redirect("/users/login");
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/");
        });
});

router.get("/verifyEmail", async (req, res, next) => {
    const { session } = req;
    const { secret } = req.query;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await userModel
        .updateOne(
            {
                $and: [
                    {
                        email_valid: false,
                    },
                    {
                        email_secret: sanitize(secret),
                    },
                ],
            },
            {
                $set: {
                    email_valid: true,
                    email_secret: null,
                },
            }
        )
        .then((updatedUser) => {
            if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "인증에 성공하였습니다!");
            } else {
                req.flash("show", "true");
                req.flash("message", "인증에 실패하였습니다");
            }
            res.redirect("/users/login");
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/");
        });
});

router.get("/searchNickname", async (req, res, next) => {
    const { id } = req.query;

    const { guild, server, profile } = await getGuild(id);

    res.json({
        guild: sanitize(guild),
        server: sanitize(server),
        profile: sanitize(profile),
    });
});

module.exports = router;
