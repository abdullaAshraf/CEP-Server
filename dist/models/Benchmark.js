"use strict";
class Benchmark {
    constructor(type, value, recordedAt = new Date()) {
        this.type = type;
        this.value = value;
        this.recordedAt = recordedAt;
    }
}
