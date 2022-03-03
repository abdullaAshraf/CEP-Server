"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static arrayIntersect(a, b) {
        return a.some(item => b.includes(item));
    }
}
exports.default = Utils;
