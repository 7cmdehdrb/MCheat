var express = require("express");
var router = express.Router();
import sanitize from "mongo-sanitize";
import { User } from "../models/users";
import { IP, getBannedIps } from "../models/ips";
import { csrfProtection } from "../../middleware";
import "../../env";

// 메뉴

router.get("/", (req, res, next) => {
    const { session } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    res.render("admin/adminMenu", { session: session, show: show, message: message });
});

// 관리자 권한 받기

router.get("/getAdminPermission", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    res.render("admin/getAdminPermission", { session: session, csrfToken: csrfToken });
});

router.post("/getAdminPermission", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { adminKey } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == true) {
        res.redirect("/admin");
        return;
    }

    if (sanitize(adminKey) == process.env.ADMIN_KEY) {
        await User.updateOne(
            {
                $and: [
                    {
                        email: sanitize(session.user.email),
                    },
                    {
                        is_admin: false,
                    },
                ],
            },
            {
                $set: {
                    is_admin: true,
                },
            }
        )
            .then((newAdmin) => {
                if (newAdmin.nModified == 1) {
                    req.flash("show", "true");
                    req.flash("message", "관리자권한 부여에 성공하였습니다! 재로그인 해주세요");
                    session.destroy();
                    res.redirect("/");
                } else {
                    throw Error();
                }
            })
            .catch((err) => {
                console.log(err);
                req.flash("show", "true");
                req.flash("message", "알 수 없는 오류가 발생하였습니다");
                res.redirect("/");
            });
    } else {
        req.flash("show", "true");
        req.flash("message", "관리자 키가 일치하지 않습니다");
        res.redirect("/");
    }
});

// 차단 유저 관리

router.get("/prohibitIp", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { page } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    await IP.paginate(
        {
            // query
        },
        {
            sort: "ip",
            page: page || 1,
            limit: 20,
        },
        {}
    )
        .then((ip) => {
            const { docs, page, totalPages } = ip;
            res.render("admin/prohibitIp", { session: session, ip: docs, current_page: page, total_page: totalPages, show: show, message: message, csrfToken: csrfToken });
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/");
        });
});

// 차단 유저 등록

router.post("/newProhibition", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { ip } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    const newIp = await IP.create({
        ip: sanitize(ip),
    }).catch((err) => {
        console.log(err);
    });

    if (newIp == null) {
        req.flash("show", "true");
        req.flash("message", "추가에 실패하였습니다");
        res.redirect("/admin/prohibitIp");
    } else {
        await getBannedIps(); // cannot use then

        req.flash("show", "true");
        req.flash("message", `${newIp.ip}가 차단 목록에 추가되었습니다`);
        res.redirect("/admin/prohibitIp");
    }
});

// 차단 유저 해제

router.get("/removeProhibition", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    res.render("admin/removeProhibition", { id: id, csrfToken: csrfToken });
});

router.post("/removeProhibition", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    const removeIp = await IP.deleteOne({
        _id: sanitize(id),
    }).catch((err) => {
        console.log(err);
    });

    if (removeIp.deletedCount == 1) {
        await getBannedIps(); // cannot use then

        req.flash("show", "true");
        req.flash("message", "삭제에 성공했습니다");
        res.redirect("/admin/prohibitIp");
    } else {
        console.log(removeIp);

        req.flash("show", "true");
        req.flash("message", "삭제에 실패하였습니다");
        res.redirect("/admin/prohibitIp");
    }
});

// 유저 리스트

router.get("/allUsers", async (req, res, next) => {
    const { session } = req;
    const { page, key, value } = req.query;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    let query;

    if (value) {
        // 검색 조건이 있을 때
        query = {
            [key]: {
                $regex: `.*${sanitize(value)}.*`,
            },
        };
    } else {
        query = {};
    }

    await User.paginate(
        query,
        {
            select: `
            email
            nickname
            server
            guild
            farm
            profile
            email_secret
            email_valid
            is_admin
            is_activated
            `,
            page: page || 1,
            limit: 15,
        },
        {}
    )
        .then((users) => {
            const { docs, page, totalPages } = users;
            res.render("admin/adminAllUsers", { session: session, users: docs, current_page: page, total_page: totalPages, show: show, message: message });
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생하였습니다");
            res.redirect("/");
        });
});

// 프로필 변경

router.get("/editProfile", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    await User.findOne({
        email: sanitize(id),
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
        .then((targetUser) => {
            if (targetUser == null) {
                throw Error();
            }
            res.render("user/editProfile", { session: session, defaultUser: targetUser, show: show, message: message, csrfToken: csrfToken });
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "해당 유저를 찾을 수 없습니다");
            res.redirect("/admin");
        });
});

router.post("/editProfile", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { email, farm, nickname, server, guild, profile, bio } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    await User.updateOne(
        {
            email: sanitize(email),
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
                req.flash("message", "성공적으로 변경하였습니다!");
                res.redirect("/admin/allUsers");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생하였습니다");
            res.redirect("/admin/allUsers");
        });
});

// 유저 (비)활성화

router.get("/changeActivation", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { id, status } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    res.render("admin/changeActivation", { id: id, status: status, csrfToken: csrfToken });
});

router.post("/changeActivation", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id, status } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    await User.updateOne(
        {
            $and: [
                {
                    email: sanitize(id),
                },
                {
                    is_activated: sanitize(status) == "activate" ? true : false,
                },
            ],
        },
        {
            $set: {
                is_activated: sanitize(status) == "activate" ? false : true,
            },
        }
    )
        .then((updatedUser) => {
            if (updatedUser.nModified == 1) {
                req.flash("show", "true");
                req.flash("message", "성공적으로 변경하였습니다");
                res.redirect("/admin/allUsers");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생하였습니다");
            res.redirect("/admin/allUsers");
        });
});

// 유저 완전 삭제

router.get("/deleteUser", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    res.render("admin/deleteUser", { id: id, csrfToken: csrfToken });
});

router.post("/deleteUser", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin == false) {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    await User.deleteOne({
        email: sanitize(id),
    })
        .then((deletedUser) => {
            if (deletedUser.deletedCount == 1) {
                req.flash("show", "true");
                req.flash("message", "성공적으로 삭제하였습니다");
                res.redirect("/");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생하였습니다");
            res.redirect("/admin/allUsers");
        });
});

module.exports = router;
