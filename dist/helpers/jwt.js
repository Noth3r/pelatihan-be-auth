"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJwt = exports.verifyJwt = exports.createAccessToken = exports.createRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/* Create token */
const createRefreshToken = ({ _id, name, email }) => {
    return jsonwebtoken_1.default.sign({ _id, name, email }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRED_IN,
    });
};
exports.createRefreshToken = createRefreshToken;
const createAccessToken = ({ _id, name, email }) => {
    return jsonwebtoken_1.default.sign({ _id, name, email }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRED_IN,
    });
};
exports.createAccessToken = createAccessToken;
/* Verify JWT */
const verifyJwt = (token, key) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, key);
        return { payload: decoded, expired: false };
    }
    catch (err) {
        return {
            payload: null,
            expired: err.message.includes("jwt expired"),
        };
    }
};
exports.verifyJwt = verifyJwt;
const decodeJwt = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (err) {
        return null;
    }
};
exports.decodeJwt = decodeJwt;
