class Benchmark {
    type: string;
    value: number;
    recordedAt: Date;

    constructor(type: string, value: number, recordedAt: Date = new Date()) {
        this.type = type;
        this.value = value;
        this.recordedAt = recordedAt;
    }
}