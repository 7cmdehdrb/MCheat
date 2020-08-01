import mongoose from "mongoose";
import "./env";

if (process.env.DEBUG == "true") {
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
} else {
    mongoose.connect(process.env.MONGODB_URI, {
        user: process.env.DB_USER,
        pass: process.env.DB_PW,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const db = mongoose.connection;

db.once("open", () => {
    console.log("MongoDB Connect!");
});
