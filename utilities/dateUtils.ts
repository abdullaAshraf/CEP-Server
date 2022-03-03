export default class DateUtils {
    static minutesBetween(start: Date, end: Date) {
        const diffMs = (end.valueOf() - start.valueOf());
        return Math.round(((diffMs % 86400000) % 3600000) / 60000);
    }
}

