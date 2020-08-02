import "./env";
import multer from "multer";
import multerS3 from "multer-s3";
import { newDatetimeFormat } from "./utils";
var AWS = require("aws-sdk");

AWS.config = {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
    region: "ap-northeast-2",
};

const s3 = new AWS.S3();

export const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "mcheat-s3-bucket/uploads",
        acl: "public-read-write",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const {
                session: {
                    user: { email },
                },
            } = req;
            const { title } = req.body;
            const { mimetype } = file;

            const dateFormat = newDatetimeFormat();
            const fileType = mimetype.split("/")[1];

            const newFileName = `${dateFormat}_${email}_${title}.${fileType}`;
            cb(null, newFileName);
        },
    }),
});

export const cheatUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "mcheat-s3-bucket/cheatUploads",
        acl: "public-read-write",
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
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
