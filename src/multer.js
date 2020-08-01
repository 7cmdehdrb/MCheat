import multer from "multer";
import { newDatetimeFormat } from "./utils";

export const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/uploads/");
        },
        filename: function (req, file, cb) {
            const { writerEmail, title } = req.body;
            const { mimetype } = file;

            const dateFormat = newDatetimeFormat();
            const fileType = mimetype.split("/")[1];

            const newFileName = `${dateFormat}_${writerEmail}_${title}.${fileType}`;

            cb(null, newFileName);
        },
    }),
});

export const cheatUpload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "public/cheatUploads/");
        },
        filename: function (req, file, cb) {
            const {
                session: {
                    user: { email },
                },
            } = req;
            const { mimetype, originalname } = file;

            const dateFormat = newDatetimeFormat();
            const fileType = mimetype.split("/")[1];

            const newFileName = `${dateFormat}_${email}_${originalname}.${fileType}`;

            cb(null, newFileName);
        },
    }),
});
