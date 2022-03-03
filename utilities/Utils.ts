export default class Utils {
    static arrayIntersect(a: any[], b: any[]): boolean {
        return a.some(item => b.includes(item));
    }
}

