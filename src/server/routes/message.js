var express = require("express");
var router = express.Router();
import { csrfProtection } from "../../middleware";
import { hashFunction } from "../../utils";
import sanitize from "mongo-sanitize";
import { InstantMessage, GroupMessage, GroupMessageRoom } from "../models/messages";
import { doc } from "sriracha/lib/controllers/main";

router.get("/", (req, res, next) => {
    res.redirect("/");
});

// 귓속말

router.get("/instantMessage", async (req, res, next) => {
    const { session } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const myMessages = await InstantMessage.find({
        $or: [
            {
                to: {
                    $eq: session.user.nickname,
                },
            },
            {
                from_email: {
                    $eq: session.user.email,
                },
            },
        ],
    })
        // .limit(100)
        .sort("time") // 최근이 아래
        .exec()
        .catch((err) => {
            console.log(err);
        });

    res.render("message/instantMessage", { session: session, messages: myMessages });
});

// 참여한 그룹

router.get("/groupMessage", async (req, res, next) => {
    const { session } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    await GroupMessageRoom.find({
        "roomMember.user": session.user.email,
    })
        .select(
            `
        name
        introduce
        masterEmail
        roomMember
        `
        )
        .sort("-time") // 최근이 위
        .populate("master", "_id email nickname")
        .exec()
        .then((rooms) => {
            const newRooms = rooms.filter((element) => element.master != null);
            res.render("message/groupMessageList", { session: session, rooms: newRooms, show: show, message: message });
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/");
        });
});

// 그룹체팅 생성

router.get("/newGroup", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    res.render("message/newGroup", { session: session, csrfToken: csrfToken });
});

router.post("/newGroup", async (req, res, next) => {
    const { session } = req;
    const { name, password, introduce } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await GroupMessageRoom.create({
        name: sanitize(name),
        password: hashFunction(sanitize(password)),
        introduce: sanitize(introduce),
        masterEmail: session.user.email,
        roomMember: [
            {
                user: session.user.email,
            },
        ],
    })
        .then((group) => {
            res.redirect("/messages/groupMessage");
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/");
        });
});

//  참여 가능 그룹

router.get("/joinGroupList", async (req, res, next) => {
    const { session } = req;
    const { page, search } = req.query;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    const show = req.flash("show");
    const message = req.flash("message");

    let query = {};

    if (search) {
        query = {
            $and: [
                {
                    "roomMember.user": {
                        $ne: session.user.email,
                    },
                },
                {
                    name: {
                        $regex: `.*${sanitize(search)}.*`,
                    },
                },
            ],
        };
    } else {
        query = {
            "roomMember.user": {
                $ne: session.user.email,
            },
        };
    }

    const groups = await GroupMessageRoom.paginate(
        query,
        {
            select: `
            _id
            name
            masterEmail
            roomMember
            `,
            page: page || 1,
            limit: 30,
            sort: "-time", // 최근이 위
            populate: {
                path: "master",
                select: `
                email
                nickname
                `,
                model: "User",
            },
        },
        {}
    )
        .then((groups) => {
            groups.docs = groups.docs.filter((element) => element.master != null);
            return groups;
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/");
        });

    res.render("message/groupList", { session: session, groups: groups, show: show, message: message });
});

// 그룹 가입

router.get("/joinGroup", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { room } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!room) {
        res.redirect("/messages/joinGroupList");
        return;
    }

    await GroupMessageRoom.findOne({
        _id: sanitize(room),
    })
        .select(
            `
        name
        introduce
        masterEmail
        roomMember
        `
        )
        .populate(
            "master",
            `
            email
            nickname
        `
        )
        .then((findRoom) => {
            if (findRoom == null) {
                throw Error();
            } else {
                res.render("message/joinGroup", { session: session, room: findRoom, csrfToken: csrfToken });
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/messages/joinGroupList");
        });
});

router.post("/joinGroup", async (req, res, next) => {
    const { session } = req;
    const { roomID, roomPW } = req.body;
    let check = true;

    if (!session.user) {
        res.redirect("/user/login");
        return;
    }

    const room = await GroupMessageRoom.findOne({
        $and: [
            {
                _id: sanitize(roomID),
            },
            {
                password: hashFunction(sanitize(roomPW)),
            },
        ],
    })
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (room == null) {
        req.flash("show", "true");
        req.flash("message", "비밀번호가 일치하지 않습니다");
        res.redirect("/messages/joinGroupList");
        return;
    }

    room.roomMember.forEach((element) => {
        if (element.user == session.user.email) {
            check = false;
            // 이미 가입된 상태
        }
    });

    if (check) {
        await GroupMessageRoom.updateOne(
            {
                $and: [
                    {
                        _id: sanitize(roomID),
                    },
                    {
                        password: hashFunction(sanitize(roomPW)),
                    },
                ],
            },
            {
                $push: {
                    roomMember: {
                        user: session.user.email,
                    },
                },
            }
        )
            .then((newUser) => {
                if (newUser.nModified != 1) {
                    throw Error();
                }
            })
            .catch((err) => {
                console.log(err);
                req.flash("show", "true");
                req.flash("message", "체팅방에 참여할 수 없습니다");
            });
    } else {
        req.flash("show", "true");
        req.flash("message", "이미 참여중인 체팅방입니다");
    }

    res.redirect("/messages/groupMessage");
});

// 그룹 나가기
// CSRF 인증

router.get("/leaveGroup", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { room } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!room) {
        res.redirect("/messages/groupMessage");
        return;
    }

    res.render("message/leaveGroup", { session: session, room: room, csrfToken: csrfToken });
});

router.post("/leaveGroup", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { room } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!room) {
        res.redirect("/messages/groupMessage");
        return;
    }

    await GroupMessageRoom.updateOne(
        {
            $and: [
                {
                    _id: sanitize(room),
                },
                {
                    "roomMember.user": session.user.email,
                },
                {
                    masterEmail: {
                        $ne: session.user.email,
                    },
                },
            ],
        },
        {
            $pull: {
                roomMember: {
                    user: session.user.email,
                },
            },
        }
    )
        .then((updateOne) => {
            if (updateOne.nModified == 1) {
                res.redirect("/messages/groupMessage");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "실패하였습니다");
            res.redirect("/messages/groupMessage");
        });
});

// 그룹 삭제
// CSRF 인증

router.get("/deleteGroup", csrfProtection, (req, res, next) => {
    const { session } = req;
    const { room } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!room) {
        res.redirect("/messages/groupMessage");
        return;
    }

    res.render("message/deleteGroup", { room: room, csrfToken: csrfToken });
});

router.post("/deleteGroup", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { room } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!room) {
        res.redirect("/messages/groupMessage");
        return;
    }

    await GroupMessageRoom.deleteOne({
        $and: [
            {
                _id: sanitize(room),
            },
            {
                masterEmail: session.user.email,
            },
        ],
    })
        .then((deleteOne) => {
            if (deleteOne.deletedCount == 1) {
                res.redirect("/messages/groupMessage");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "삭제에 실패하였습니다");
            res.redirect("/messages/groupMessage");
        });
});

// 그룹 체팅방

router.get("/groupMessageRoom", async (req, res, next) => {
    const { session } = req;
    const { room } = req.query;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!room) {
        res.redirect("/messages/groupMessage");
        return;
    }

    let group = await GroupMessageRoom.findOne({
        $and: [
            {
                "roomMember.user": session.user.email,
            },
            {
                _id: sanitize(room),
            },
        ],
    })
        .select(
            `
        name
        introduce
        masterEmail
        roomMember
        `
        )
        .populate(
            "master",
            `email
            nickname
        `
        )
        .exec()
        .catch((err) => {
            console.log(err);
            res.send(`
                <script>
                    window.close()
                </script>
            `);
        });

    if (group == null) {
        res.redirect("/messages/groupMessage");
        return;
    }

    if (group.master == null) {
        res.redirect("/messages/groupMessage");
        return;
    }

    let messages = await GroupMessage.find({
        room: sanitize(room),
    })
        .select(
            `
        from
        from_email
        message
        `
        )
        .populate(
            "user",
            `
            email
            nickname
            `
        )
        .sort("time") // 최근이 아래
        .exec()
        .catch((err) => {
            console.log(err);
        });

    messages = messages.filter((element) => element.user != null);

    res.render("message/groupMessageRoom", { session: session, group: group, messages: messages });
});

module.exports = router;
