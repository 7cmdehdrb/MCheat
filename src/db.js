import mongoose from "mongoose";
import "./env";

console.log(process.env.DEBUG);

if (process.env.DEBUG == "true") {
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
} else {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const db = mongoose.connection;

db.once("open", () => {
    console.log("MongoDB Connect!");
});
