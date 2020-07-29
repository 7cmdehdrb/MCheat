var express = require("express");
var router = express.Router();
import sanitize from "mongo-sanitize";
import { User } from "../models/users";
import { getGuild, hashFunction, createUUID, sendMail, sendResetMail } from "../../utils";
import { csrfProtection } from "../../middleware";

/* GET users listing. */
router.get("/", async (req, res, next) => {
    res.redirect("/");
});

// 로그인

router.get("/login", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/login", { session: session, show: show, message: message, csrfToken: csrfToken });
});

router.post("/login", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { email, password } = req.body;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await User.findOne({
        $and: [{ email: sanitize(email) }, { password: hashFunction(sanitize(password)) }],
    })
        .select(
            `
        email
        nickname
        email_valid
        is_admin
        is_activated
        `
        )
        .exec()
        .then((user) => {
            console.log("Login");
            console.log(user);
            if (user == null) {
                throw Error();
            } else {
                if (user.email_valid == false) {
                    req.flash("show", true);
                    req.flash("message", "이메일 인증을 진행해주세요");
                    res.redirect("/users/login");
                } else if (user.is_activated == false) {
                    req.flash("show", true);
                    req.flash("message", "비활성화된 계정입니다 관리자에게 문의해주세요");
                    res.redirect("/users/login");
                } else {
                    session.user = user;
                    session.save(() => {
                        res.redirect("/");
                    });
                }
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "로그인에 실패했습니다");
            res.redirect("/users/login");
        });
});

// 로그아웃

router.get("/logout", (req, res, next) => {
    const { session } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const user = session.user.email;

    session.destroy();

    res.render("user/logout", { user: user });
});

// 회원가입

router.get("/signup", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (session.user) {
        res.redirect("user/logout");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/signup", { session: session, show: show, message: message, csrfToken: csrfToken });
});

router.post("/signup", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { email, password, nickname, server, guild, farm, profile } = req.body;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await User.create({
        email: sanitize(email),
        password: sanitize(hashFunction(password)),
        nickname: sanitize(nickname),
        server: sanitize(server),
        guild: sanitize(guild),
        farm: sanitize(farm.trim()),
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
            req.flash("message", "회원가입에 실패하였습니다. 이미 가입된 이메일/캐릭터입니다. 만약 다른 계정/캐릭터로도 이 오류가 지속된다면 관리자에게 문의해주십시오");
            res.redirect("/users/signup");
        });
});

// 프로필 보기

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
        targetUser = await User.findOne({
            email: session.user.email,
        })
            .select(
                `
            email
            nickname
            server
            guild
            farm
            profile
            bio
            email_valid
            is_admin
            is_activated
            `
            )
            .exec()
            .catch((err) => {
                console.log(err);
                res.redirect("/");
            });
    } else {
        targetUser = await User.findOne({
            email: sanitize(id),
        })
            .select(
                `
                email
                nickname
                server
                guild
                farm
                profile
                bio
                email_valid
                is_admin
                is_activated
                `
            )
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

// 개인정보 수정

router.get("/editProfile", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    const show = req.flash("show");
    const message = req.flash("message");

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const defaultUser = await User.findOne({
        email: session.user.email,
    })
        .select(
            `
        email
        nickname
        farm
        bio
        `
        )
        .exec()
        .catch((err) => {
            console.log(err);
            res.redirect("/");
            return;
        });

    if (defaultUser == null) {
        res.redirect("/");
        return;
    }

    res.render("user/editProfile", { session: session, defaultUser: defaultUser, show: show, message: message, csrfToken: csrfToken });
});

router.post("/editProfile", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { farm, nickname, server, guild, profile, bio } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await User.updateOne(
        {
            email: session.user.email,
        },
        {
            $set: {
                nickname: sanitize(nickname),
                server: sanitize(server),
                guild: sanitize(guild),
                farm: sanitize(farm.trim()),
                profile: sanitize(profile),
                bio: sanitize(bio),
            },
        }
    )
        .then((updatedUser) => {
            if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "정보를 변경했습니다! 다시 로그인 하여 정보를 갱신해주세요");
                res.redirect("/users/logout");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "정보를 변경할 수 없습니다. 이미 사용중인 캐릭터일 수 있습니다");
            res.redirect("/users/editProfile");
        });
});

// 비밀번호 변경

router.get("/changePassword", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/changePassword", { session: session, show: show, message: message, csrfToken: csrfToken });
});

router.post("/changePassword", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { current_password, password } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await User.updateOne(
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
            if (user.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "비밀번호 변경했습니다! 다시 로그인 하여 정보를 갱신해주세요");
                res.redirect("/users/logout");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "비밀번호 변경할 수 없습니다");
            res.redirect("/users/changePassword");
        });
});

// 비밀번호 초기화

router.get("/findPassword", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("user/findPassword", { session: session, show: show, message: message, csrfToken: csrfToken });
});

router.post("/findPassword", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { email, nickname } = req.body;
    const newSecret = createUUID();

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    const targetUser = await User.findOne({
        $and: [
            {
                email: sanitize(email),
            },
            {
                nickname: sanitize(nickname),
            },
        ],
    })
        .select("_id")
        .exec()
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/users/findPassword");
            return;
        });

    if (targetUser == null) {
        req.flash("show", "true");
        req.flash("message", "해당 사용자를 찾을 수 없습니다");
        res.redirect("/users/findPassword");
        return;
    }

    await User.updateOne(
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
                sendResetMail(email, newSecret);
                req.flash("show", "true");
                req.flash("message", "이메일을 확인해주세요");
                res.redirect("/users/login");
            } else {
                throw Error();
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

// Email > Reset Password

router.get("/resetPassword", async (req, res, next) => {
    const { session } = req;
    const { secret } = req.query;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await User.updateOne(
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
                req.flash("message", "비밀번호가 성공적으로 초기화되었습니다. 로그인 후에 비밀번호를 다시 변경해주세요");
                res.redirect("/users/login");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "비밀번호 초기화에 실패하였습니다");
            res.redirect("/");
        });
});

// Email > Verify Email

router.get("/verifyEmail", async (req, res, next) => {
    const { session } = req;
    const { secret } = req.query;

    if (session.user) {
        res.redirect("/users/logout");
        return;
    }

    await User.updateOne(
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
                res.redirect("/users/login");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "인증에 실패하였습니다");
            res.redirect("/");
        });
});

// Sign up > Find Char

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
