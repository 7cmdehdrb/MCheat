import mongoose from "mongoose";
import "./env";

if (process.env.DEBUG == "true") {
    console.log("USE LOCAL MONGODB...");
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
} else {
    console.log("USE WEB MONGODB...");
    mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PW}@ds163226.mlab.com:63226/heroku_qgv38qmv`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const db = mongoose.connection;

db.once("open", () => {
    console.log("MongoDB Connect!");
});
