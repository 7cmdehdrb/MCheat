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

// req.body {
//     writerEmail: '7cmdehdrb@naver.com',
//     tag: '자유',
//     title: 'asd',
//     content: 'asd'
//   }
// file
// {
//     fieldname: 'inputFile',
//     originalname: '1.PNG',
//     encoding: '7bit',
//     mimetype: 'image/png'
//   }
