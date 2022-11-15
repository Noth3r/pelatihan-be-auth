"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const google_auth_library_1 = require("google-auth-library");
dotenv_1.default.config();
exports.default = new google_auth_library_1.OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, "postmessage");
