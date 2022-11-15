"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.signIn = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const google_1 = __importDefault(require("../helpers/google"));
const jwt_1 = require("../helpers/jwt");
const Token_1 = __importDefault(require("../models/Token"));
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Must provide email and password" });
    let user = yield User_1.default.findOne({ email });
    if (user) {
        return res.status(400).json({ error: "Email already in use" });
    }
    const salt = bcrypt_1.default.genSaltSync(10);
    const hash = bcrypt_1.default.hashSync(password, salt);
    user = new User_1.default({
        name,
        email,
        password: hash,
    });
    user.save((err) => {
        if (err) {
            return res.status(400).json({ error: "Error saving user to database" });
        }
        res.json({ message: "User created successfully" });
    });
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, tokenId } = req.body;
    if (tokenId) {
        const { tokens } = yield google_1.default.getToken(tokenId);
        const decode = (0, jwt_1.decodeJwt)(tokens.id_token);
        if (!decode)
            return res.status(400).json({ error: "Invalid token" });
        const { email, name, sub } = decode;
        let user = yield User_1.default.findOne({ email });
        if (!user) {
            const salt = bcrypt_1.default.genSaltSync(10);
            const hash = bcrypt_1.default.hashSync(sub, salt);
            user = new User_1.default({
                name,
                email,
                password: hash,
            });
            user.save((err, user) => {
                if (err) {
                    return res
                        .status(400)
                        .json({ error: "Error saving user to database" });
                }
                return res.json({ name, email, picture: user.picture });
            });
        }
        else {
            return sendToken(user, 200, res, {
                email: user.email,
                picture: user.picture,
            });
        }
    }
    else {
        if (!email || !password)
            return res.status(400).json({ error: "Must provide email and password" });
        const user = yield User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ error: "Invalid email or password" });
        const compare = bcrypt_1.default.compareSync(password, user === null || user === void 0 ? void 0 : user.password);
        if (compare)
            sendToken(user, 200, res, {
                email: user.email,
                picture: user.picture,
            });
        else
            res.status(400).json({ error: "Invalid email or password" });
    }
});
exports.signIn = signIn;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.refreshToken;
    if (!token)
        return res.status(401).json({ message: "No token" });
    const { payload } = (0, jwt_1.verifyJwt)(token, process.env.JWT_REFRESH_SECRET);
    if (!payload)
        return res.status(401).json({ message: "Invalid token" });
    const isActive = yield checkRevoke(payload._id + "++" + token);
    if (!isActive) {
        yield revokeAllToken(payload._id);
        return res.status(401).json({ message: "Invalid token" });
    }
    else {
        yield Token_1.default.findOneAndUpdate({ token: payload._id + "++" + token }, { isActive: false });
    }
    sendToken(payload, 200, res, null);
});
exports.refreshToken = refreshToken;
const checkRevoke = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const isActive = yield Token_1.default.findOne({ token, isActive: true });
    return isActive ? true : false;
});
const revokeAllToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const tokens = yield Token_1.default.find({ token: new RegExp(`^${userId}`) });
    tokens.forEach((token) => token.remove());
});
const sendToken = (user, statusCode, res, message) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = (0, jwt_1.createRefreshToken)(user);
    const accessToken = (0, jwt_1.createAccessToken)(user);
    const token = new Token_1.default({ token: user._id + "++" + refreshToken });
    yield token.save();
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 1000 * 60 * 24 * 7,
        secure: true,
        sameSite: "strict",
    });
    return res.status(statusCode).json({
        success: true,
        message: Object.assign(Object.assign({}, message), { token: accessToken }),
    });
});
