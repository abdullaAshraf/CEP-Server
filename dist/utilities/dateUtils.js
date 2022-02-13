"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static minutesBetween(start, end) {
        const diffMs = (end.valueOf() - start.valueOf());
        return Math.round(((diffMs % 86400000) % 3600000) / 60000);
    }
}
exports.default = Utils;
