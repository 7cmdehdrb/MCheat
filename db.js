import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/MCheat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once("open", () => {
    console.log("MongoDB Connect!");
});
