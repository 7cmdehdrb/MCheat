var express = require("express");
var router = express.Router();
import sanitize from "mongo-sanitize";
import { Community, Comment } from "../models/communities";
import { datetimeToString, getTag } from "../../utils";
import { upload } from "../../multer";
import { csrfProtection } from "../../middleware";

router.get("/", async (req, res, next) => {
    res.redirect("/");
});

// 목록

router.get("/list", async (req, res, next) => {
    const { session } = req;
    const { page, tag } = req.query;
    let { key, value } = req.query;

    const show = req.flash("show");
    const message = req.flash("message");

    let query = {
        tag: {
            $ne: "공지",
        },
    };
    let currnetPage, totalPages;
    let newCommunities = [];
    let newAlerts = [];

    if (tag) {
        // 태그 조건
        query = {
            tag: getTag(tag),
        };
    } else {
        // 검색 조건
        if (key == "title") {
            query = {
                $and: [
                    {
                        tag: {
                            $ne: "공지",
                        },
                    },
                    {
                        title: {
                            $regex: `.*${sanitize(value)}.*`,
                        },
                    },
                ],
            };
        }
    }

    // 검색

    await Community.paginate(
        query,
        {
            select: "_id writerEmail tag title time recommends",
            page: page || 1,
            limit: 15,
            sort: {
                time: "desc",
            },
            populate: {
                path: "writer",
                select: `
                email
                nickname
                server
                `,
                model: "User",
            },
        },
        {}
    )
        .then(async (communities) => {
            let { docs } = communities;
            currnetPage = communities.page;
            totalPages = communities.totalPages;

            if (key == "nickname") {
                docs = docs.filter((element) => element.writer.nickname.includes(sanitize(value)));
            } else if (key == "email") {
                docs = docs.filter((element) => element.writer.email.includes(sanitize(value)));
            }

            docs.forEach((element) => {
                let temp = {
                    origin: element,
                    newTime: datetimeToString(element.time),
                };
                newCommunities.push(temp);
            });
        })
        .catch((err) => {
            console.log(err);
        });

    // 공지 찾기

    await Community.find({
        tag: {
            $eq: "공지",
        },
    })
        .select("_id writerEmail title time recommends")
        .populate(
            "writer",
            `
            email
            nickname
            server
            profile
            bio
            is_admin
        `
        )
        .limit(5)
        .sort("-time")
        .exec()
        .then((alerts) => {
            alerts.forEach((element) => {
                let temp2 = {
                    origin: element,
                    newTime: datetimeToString(element.time),
                };
                newAlerts.push(temp2);
            });
        })
        .catch((err) => {
            console.log(err);
        });

    res.render("community/list", { session: session, show: show, message: message, alerts: newAlerts, communities: newCommunities, current_page: currnetPage, total_page: totalPages });
});

// 새 글쓰기

router.get("/new", csrfProtection, (req, res, next) => {
    const { session } = req;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    res.render("community/new", { session: session, csrfToken: csrfToken });
});

router.post("/new", upload.single("inputFile"), csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { tag, title, content } = req.body;
    const { file } = req;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (session.user.is_admin != true && tag == "공지") {
        req.flash("show", "true");
        req.flash("message", "관리자 전용 기능입니다");
        res.redirect("/");
        return;
    }

    await Community.create({
        writerEmail: session.user.email,
        tag: sanitize(tag),
        title: sanitize(title),
        content: sanitize(content),
        file: Boolean(file) ? sanitize(file.filename) : null,
    })
        .then((newCommunity) => {
            if (newCommunity == null) {
                throw Error();
            }
            res.redirect(`/communities/detail?id=${newCommunity._id}`);
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

// 글보기

router.get("/detail", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    const detail = await Community.findOne({
        _id: sanitize(id),
    })
        .select(
            `
        _id
        writerEmail
        tag
        title
        content
        file
        time
        recommends
    `
        )
        .populate(
            "writer",
            `
        email
        nickname
        server
        profile
        bio
        `
        )
        .exec()
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
            return;
        });

    if (detail == null) {
        req.flash("show", "true");
        req.flash("message", "알 수 없는 오류가 발생했습니다");
        res.redirect("/communities/list");
        return;
    }

    const more = await Community.find({
        $and: [
            {
                writerEmail: detail.writer.email,
            },
            {
                tag: {
                    $ne: "공지",
                },
            },
            {
                _id: {
                    $ne: detail._id,
                },
            },
        ],
    })
        .select("_id title time")
        .sort("-time")
        .limit(7)
        .exec()
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
            return;
        });

    const comments = await Comment.find({
        noticeId: id,
    })
        .populate(
            "writer",
            `
        email
        nickname
        server
        profile
        bio
        `
        )
        .sort("time")
        .exec()
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
            return;
        });

    const newTime = datetimeToString(detail.time);

    res.render("community/detail", { session: session, detail: detail, time: newTime, more: more, comments: comments, csrfToken: csrfToken });
});

// 글 수정

router.get("/updatePost", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;
    const csrfToken = req.csrfToken();

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    await Community.findOne({
        $and: [{ _id: sanitize(id) }, { writerEmail: sanitize(session.user.email) }],
    })
        .then((targetPost) => {
            if (targetPost == null) {
                throw Error();
            }
            res.render("community/updatePost", { session, session, post: targetPost, csrfToken: csrfToken });
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

router.post("/updatePost", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { tag, title, content, id } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    await Community.updateOne(
        {
            $and: [
                {
                    writerEmail: session.user.email,
                },
                {
                    _id: sanitize(id),
                },
            ],
        },
        {
            $set: {
                tag: sanitize(tag),
                title: sanitize(title),
                content: sanitize(content),
            },
        }
    )
        .then((updatedPost) => {
            if (updatedPost.nModified == 1) {
                res.redirect(`/communities/detail?id=${id}`);
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

// 글 삭제

router.get("/deletePost", async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    await Community.deleteOne({
        $and: [
            {
                writerEmail: sanitize(session.user.email),
            },
            {
                _id: sanitize(id),
            },
        ],
    })
        .then((deletedPost) => {
            if (deletedPost.deletedCount == 1) {
                req.flash("show", "true");
                req.flash("message", "삭제를 완료하였습니다");
                res.redirect("/communities/list");
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생하였습니다");
            res.redirect("/communities/list");
        });
});

// 추천하기

router.get("/recommendPost", async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;

    if (!session.user || !id) {
        res.json({
            success: false,
        });
        return;
    }

    let action;
    let success = false;
    let count = 0;
    let increase = false;

    const recommendPost = await Community.findOne({
        $and: [
            {
                _id: sanitize(id),
            },
            {
                "recommends.recommender": session.user.email,
            },
        ],
    })
        .select("_id")
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (recommendPost == null) {
        // 추천 이력 없음
        increase = true;
        action = {
            $push: {
                recommends: {
                    recommender: session.user.email,
                },
            },
        };
    } else {
        // 추천 이력 있음
        increase = false;
        action = {
            $pull: {
                recommends: {
                    recommender: session.user.email,
                },
            },
        };
    }

    await Community.updateOne(
        {
            $and: [
                {
                    _id: sanitize(id),
                },
            ],
        },
        action
    )
        .then((updatedPost) => {
            if (updatedPost.nModified == 1) {
                success = true;
            }
        })
        .catch((err) => {
            console.log(err);
        });

    await Community.findOne({
        _id: sanitize(id),
    })
        .select("recommends")
        .exec()
        .then((rec) => {
            if (rec == null) {
                throw Error();
            }
            count = rec.recommends.length;
        })
        .catch((err) => {
            console.log(err);
        });

    res.json({
        success: success,
        count: count,
        increase: increase,
    });
});

// 댓글쓰기

router.post("/newComment", csrfProtection, async (req, res, next) => {
    const { session } = req;
    const { noticeId, content } = req.body;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!noticeId || !content) {
        req.flash("show", "true");
        req.flash("show", "알 수 없는 오류가 발생했습니다");
        res.redirect("/communities/list");
        return;
    }

    await Comment.create({
        writerEmail: session.user.email,
        noticeId: sanitize(noticeId),
        content: sanitize(content),
    })
        .then((newComment) => {
            if (newComment === null) {
                throw Error();
            }
            res.redirect(`/communities/detail?id=${noticeId}`);
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("show", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

// 댓글 삭제(수정)

router.get("/deleteComment", async (req, res, next) => {
    const { session } = req;
    const { id } = req.query;

    if (!session.user) {
        res.redirect("/users/login");
        return;
    }

    if (!id) {
        res.redirect("/communities/list");
        return;
    }

    const comment = await Comment.findOne({
        _id: sanitize(id),
    })
        .select("noticeId")
        .exec()
        .catch((err) => {
            console.log(err);
        });

    if (comment == null) {
        req.flash("show", "true");
        req.flash("show", "알 수 없는 오류가 발생했습니다");
        res.redirect("/communities/list");
        return;
    }

    await Comment.updateOne(
        {
            $and: [
                {
                    _id: sanitize(id),
                },
                {
                    writerEmail: session.user.email,
                },
            ],
        },
        {
            $set: {
                is_deleted: true,
            },
        }
    )
        .then((updatedComment) => {
            if (updatedComment.nModified == 1) {
                res.redirect(`/communities/detail?id=${comment.noticeId}`);
            } else {
                throw Error();
            }
        })
        .catch((err) => {
            console.log(err);
            req.flash("show", "true");
            req.flash("message", "알 수 없는 오류가 발생했습니다");
            res.redirect("/communities/list");
        });
});

module.exports = router;
