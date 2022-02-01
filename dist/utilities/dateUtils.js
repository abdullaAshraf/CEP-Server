"use strict";
function minutesBetween(start, end) {
    const diffMs = (end.valueOf() - start.valueOf());
    return Math.round(((diffMs % 86400000) % 3600000) / 60000);
}
