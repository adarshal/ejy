"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
const mongoose = require('mongoose');
const connectToDB = async () => {
    mongoose
        .connect(process.env.MONGO_URL)
        .then(() => console.log("DB Connection Successfull!"))
        .catch((err) => {
        console.log(err);
        throw new Error(err);
    });
};
exports.connectToDB = connectToDB;
//# sourceMappingURL=connection.js.map