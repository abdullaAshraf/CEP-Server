export default class Evaluator {
    static evaluate(assignments: Assignment[]) {
        let flowtime = 0;
        let makespan = 0;

        const deviceTotalTime = new Map<number, number>();

        assignments.forEach(assignment => {
            flowtime += assignment.estimatedTime;
            deviceTotalTime.set(assignment.device, assignment.estimatedTime + (deviceTotalTime.get(assignment.device) ?? 0));
            makespan = Math.max(makespan, deviceTotalTime.get(assignment.device) ?? 0);
        });
        
        return {
            flowtime: flowtime,
            makespan: makespan
        }
    }
}

export class Assignment {
    device: number;
    service: number;
    estimatedTime: number;
    completionTime: number;

    constructor(device: number, service: number, estimatedTime: number, completionTime: number) {
        this.device = device;
        this.service = service;
        this.estimatedTime = estimatedTime;
        this.completionTime = completionTime;
    }
}