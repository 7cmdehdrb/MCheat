import mongoose from "mongoose";
import "./env";

if (process.env.DEBUG == "true") {
    mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
} else {
    mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PW}@host1:port1,host2:port2/MCheat`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const db = mongoose.connection;

db.once("open", () => {
    console.log("MongoDB Connect!");
});
