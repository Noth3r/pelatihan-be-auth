"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const db_1 = __importDefault(require("./helpers/db"));
dotenv_1.default.config();
db_1.default.once("open", () => console.log("Connected to database"));
db_1.default.once("error", () => console.log("Error connecting to database"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/auth", auth_1.default);
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});
