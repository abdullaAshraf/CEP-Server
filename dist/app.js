"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const service_1 = __importDefault(require("./routes/service"));
const cluster_1 = __importDefault(require("./routes/cluster"));
const auth_1 = __importDefault(require("./routes/auth"));
const scheduler_1 = __importDefault(require("./services/scheduler"));
const clusterManager_1 = __importDefault(require("./services/clusterManager"));
const mongoose_1 = __importDefault(require("mongoose"));
var winston = require('winston'), expressWinston = require('express-winston');
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
require('dotenv').config();
mongoose_1.default.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.alarc.mongodb.net/OffloadingService?retryWrites=true&w=majority`, () => console.log('connected to db!'));
scheduler_1.default.initialize();
clusterManager_1.default.initialize();
// view engine setup
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ],
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
}));
app.use('/', index_1.default);
app.use('/service', service_1.default);
app.use('/cluster', cluster_1.default);
app.use('/user', auth_1.default);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//mongoose.connect("mongodb://localhost:27017/acmedb")
