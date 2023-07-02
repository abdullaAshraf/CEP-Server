import console from "console";
import Utils from "../utilities/Utils";
import Evaluator, { Assignment } from "./evaluator";
import Generator, { Device } from "./generator";
import { MinCostMaxFlow } from "./minCostMaxFlow";
import {v4 as uuidv4} from 'uuid';
import fs from 'fs';

var munkres = require('munkres-js');

const util = require('util')

class Evaluation {
    name: string;
    runTime: number;
    matched: number;
    flowtime: number;
    makespan: number;
    dataGroup: string;

    constructor(name: string, runTime: number, matched: number, flowtime: number, makespan: number, dataGroup: string) {
        this.name = name;
        this.runTime = runTime;
        this.matched = matched;
        this.flowtime = flowtime;
        this.makespan = makespan;
        this.dataGroup = dataGroup;
    }
}

enum Scheduler {
    MIN_MIN = 'Min-Min',
    MAX_MIN = 'Max-Min',
    LJFR_SJFR = 'LJFR_SJFR',
    WORK_QUEUE = 'Work Queue',
    SUFFERAGE = 'Sufferage',
    MIN_COST_MAX_FLOW = 'Min Cost Max Flow',
    MUNKRES = 'Munkres'
}

export default class DemoScheduler {
    static test() {
        const dataSizes = [600];
        const schedulers = [
            Scheduler.MIN_MIN,
            Scheduler.MAX_MIN,
            Scheduler.LJFR_SJFR,
            Scheduler.WORK_QUEUE,
            Scheduler.SUFFERAGE,
            Scheduler.MIN_COST_MAX_FLOW,
            Scheduler.MUNKRES
        ]
        const runsPerSize = 5;
        dataSizes.forEach(dataSize => {
            for(let i=0; i<runsPerSize; i++) {
                this.runAllVariations(dataSize, schedulers);
            }
        });
    }

    static runAllVariations(dataSize: number, schedulers: Scheduler[]) {
        const results = [];

        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 1, 0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 1, 0.5, 5, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 1, -0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 1, -0.5, 5, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 50, 0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 50, 0.5, 5, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 50, -0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 1, 50, -0.5, 5, schedulers));

        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 1, 0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 1, 0.5, 5, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 1, -0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 1, -0.5, 5, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 50, 0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 50, 0.5, 5, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 50, -0.5, 3, schedulers));
        results.push(this.matchAll(dataSize, dataSize, dataSize/10, 50, 50, -0.5, 5, schedulers));

        this.printResults(results);
    }

    static matchAll(numberOfService: number, numberOfDevices: number, numberOfCommunities: number, serviceHetro: number, deviceHetro: number,
         matrixConsistency: number, density: number, schedulers: Scheduler[]): Evaluation[] {
        let data = Generator.generate(numberOfService, numberOfDevices, numberOfCommunities, serviceHetro, deviceHetro, matrixConsistency, density);
        let result = this.testWithData(data, schedulers);
        let tries = 10;
        while (--tries > 0 && result.some((evaluation: Evaluation) => !this.isAllMatched(evaluation))) {
            console.log('retry', tries);
            data = Generator.generate(numberOfService, numberOfDevices, numberOfCommunities, serviceHetro, deviceHetro, matrixConsistency, density);
            result = this.testWithData(data, schedulers);
        }
        return result;
    }

    static printResults(results: Evaluation[][]) {
        const runTime: any = {};
        const flowtime: any = {};
        const makespan: any = {};

        results.forEach(result => {
            // handle matching less than all
            if (result.some(evaluation => !this.isAllMatched(evaluation))) {
                const missing = result.filter(evaluation => !this.isAllMatched(evaluation)).map(evaluation => evaluation.name);
                console.error(`the data group ${result[0].dataGroup} have some algorithms that didn't match all services: `, missing);
            }
            runTime[result[0].dataGroup] = result.reduce((obj, cur) => ({...obj, [cur.name]: this.isAllMatched(cur) ? cur.runTime : '-'}), {});
            flowtime[result[0].dataGroup] = result.reduce((obj, cur) => ({...obj, [cur.name]: this.isAllMatched(cur) ? Number (cur.flowtime.toFixed(0)) : '-'}), {});
            makespan[result[0].dataGroup] = result.reduce((obj, cur) => ({...obj, [cur.name]: this.isAllMatched(cur) ? Number (cur.makespan.toFixed(0)) : '-'}), {});
        });

        this.calculateMean(runTime);
        this.calculateMean(flowtime);
        this.calculateMean(makespan);

        console.table(runTime);
        console.table(flowtime);
        console.table(makespan);

        const uuid = uuidv4();

        this.saveTable('runTime' + uuid, runTime);
        this.saveTable('flowtime' + uuid, flowtime);
        this.saveTable('makespan' + uuid, makespan);
    }

    static saveTable(name: string, table: any) {
        let writeStream = fs.createWriteStream(`${process.env.SERVER_PATH}\\results\\${name}.csv`)
        const columns =  'instances,' + Object.keys(table['mean']).join(',') + '\n';
        writeStream.write(columns, () => {});
        Object.keys(table).forEach(key => {
            const row = key + ',' + Object.values(table[key]).join(',') + '\n';
            writeStream.write(row, () => {});
        });
        writeStream.end();
        writeStream.on('finish', () => {
            console.log('finish write stream, moving along')
        }).on('error', (err) => {
            console.log(err)
        })
    }

    static calculateMean(table: any) {
        const len = Object.keys(table).length;
        const mean: any = {};
        Object.values(table).forEach((row: any) => {
            Object.keys(row).forEach(algo => {
                mean[algo] = (mean.hasOwnProperty(algo) ? mean[algo] : 0) + row[algo];
            });
        });
        table['mean'] = mean;
        
        Object.keys(table['mean']).forEach((algo: string | number) => table['mean'][algo] = Number((table['mean'][algo] / len).toFixed(0)));
    }

    static testWithData(data: any, schedulers: Scheduler[]) : Evaluation[] {
        //console.log(util.inspect(data.etc, {showHidden: false, depth: null, colors: true}));
        console.log('run with data', data.name);
        fs.writeFile(`${process.env.SERVER_PATH}\\data\\${data.name}.txt`, JSON.stringify(data), (err: any) => {
            if (err) {
              console.error(err)
            }
          })

        const evaluations: Evaluation[] = [];

        schedulers.forEach(scheduler => {
            const begin = Date.now();
            let assignments: Assignment[];
            switch (scheduler) {
                case Scheduler.MIN_MIN:
                    assignments = DemoScheduler.scheduleMinMin(data.devices, data.servicesCommunities, data.etc);
                    break;
                case Scheduler.MAX_MIN:
                    assignments = DemoScheduler.scheduleMaxMin(data.devices, data.servicesCommunities, data.etc);
                    break;
                case Scheduler.LJFR_SJFR:
                    assignments = DemoScheduler.scheduleLJFR_SJFR(data.devices, data.servicesCommunities, data.etc);
                    break;
                case Scheduler.WORK_QUEUE:
                    assignments = DemoScheduler.scheduleWorkQueue(data.devices, data.servicesCommunities, data.etc);
                    break;
                case Scheduler.SUFFERAGE:
                    assignments = DemoScheduler.scheduleSufferage(data.devices, data.servicesCommunities, data.etc);
                    break;
                case Scheduler.MIN_COST_MAX_FLOW: 
                    assignments = DemoScheduler.scheduleMinCostMaxFlow(data.etc, 1.5);
                    break;
                case Scheduler.MUNKRES:
                    assignments = DemoScheduler.scheduleMunkres(data.devices, data.servicesCommunities, data.etc);
                    break;
                default:
                    console.error('unsupported schedular type');
                    return;
            }
            const end = Date.now();
            const results = Evaluator.evaluate(assignments);
            evaluations.push(new Evaluation(scheduler, end-begin, assignments.length, results.flowtime, results.makespan, data.name));
        });
        
    
        return evaluations;
    }

    static scheduleMinMin(devices: Device[], servicesCommunities: number[],  etc: number[][]) : Assignment[] {
        DemoScheduler.clearAssignments(devices);

        const assignments: Assignment[] = [];

        while (true) {
            let chosenAssignment = new Assignment(-1, -1, -1, -1);
            for(let service = 0; service < servicesCommunities.length; service++) {
                if (assignments.some((assignment: { service: number; }) => assignment.service == service)) {
                    continue;
                }
                const minServiceAssignment = DemoScheduler.minCompletionTimes(service, servicesCommunities, devices, etc);
                if (minServiceAssignment.device != -1 && (chosenAssignment.device == -1 || chosenAssignment.completionTime > minServiceAssignment.completionTime)) {
                    chosenAssignment = minServiceAssignment;
                }
            }

            if(chosenAssignment.device == -1)
                break;
            assignments.push(chosenAssignment);
            devices[chosenAssignment.device].assign(chosenAssignment.service);
        }

        return assignments;
    }

    static scheduleSufferage(devices: Device[], servicesCommunities: number[],  etc: number[][]) : Assignment[] {
        DemoScheduler.clearAssignments(devices);

        const assignments: Assignment[] = [];

        while (true) {
            let maxSuffrage = -1;
            let chosenAssignment = new Assignment(-1, -1, -1, -1);
            for(let service = 0; service < servicesCommunities.length; service++) {
                if (assignments.some((assignment: { service: number; }) => assignment.service == service)) {
                    continue;
                }
                const minServiceAssignment = DemoScheduler.minCompletionTimes(service, servicesCommunities, devices, etc);
                if (minServiceAssignment.device != -1) {
                    devices[minServiceAssignment.device].assign(minServiceAssignment.service);
                    const secondMinServiceAssignment = DemoScheduler.minCompletionTimes(service, servicesCommunities, devices, etc);
                    devices[minServiceAssignment.device].clear();

                    if (maxSuffrage == -1 || secondMinServiceAssignment.device == -1 || maxSuffrage < secondMinServiceAssignment.completionTime - minServiceAssignment.completionTime) {
                        chosenAssignment = minServiceAssignment;
                        if (secondMinServiceAssignment.device == -1) {
                            maxSuffrage = minServiceAssignment.completionTime;
                        } else {
                            maxSuffrage = secondMinServiceAssignment.completionTime - minServiceAssignment.completionTime;
                        }
                    }
                }
            }

            if(chosenAssignment.device == -1)
                break;
            assignments.push(chosenAssignment);
            devices[chosenAssignment.device].assign(chosenAssignment.service);
        }

        return assignments;
    }

    static scheduleMaxMin(devices: Device[], servicesCommunities: number[],  etc: number[][]) : Assignment[] {
        DemoScheduler.clearAssignments(devices);

        const assignments: Assignment[] = [];

        while (true) {
            let chosenAssignment = new Assignment(-1, -1, -1, -1);
            for(let service = 0; service < servicesCommunities.length; service++) {
                if (assignments.some((assignment: { service: number; }) => assignment.service == service)) {
                    continue;
                }
                const minServiceAssignment = DemoScheduler.minCompletionTimes(service, servicesCommunities, devices, etc);
                if (minServiceAssignment.device != -1 && (chosenAssignment.device == -1 || chosenAssignment.completionTime < minServiceAssignment.completionTime)) {
                    chosenAssignment = minServiceAssignment;
                }
            }

            if(chosenAssignment.device == -1)
                break;
            assignments.push(chosenAssignment);
            devices[chosenAssignment.device].assign(chosenAssignment.service);
        }

        return assignments;
    }

    static scheduleLJFR_SJFR(devices: Device[], servicesCommunities: number[],  etc: number[][]) : Assignment[] {
        DemoScheduler.clearAssignments(devices);

        const assignments: Assignment[] = [];

        while (true) {
            let chosenAssignment = new Assignment(-1, -1, -1, -1);
            for(let service = 0; service < servicesCommunities.length; service++) {
                if (assignments.some((assignment: { service: number; }) => assignment.service == service)) {
                    continue;
                }
                const minServiceAssignment = DemoScheduler.minCompletionTimes(service, servicesCommunities, devices, etc);
                if (assignments.length % 2) {
                    if (minServiceAssignment.device != -1 && (chosenAssignment.device == -1 || chosenAssignment.completionTime < minServiceAssignment.completionTime)) {
                        chosenAssignment = minServiceAssignment;
                    }
                } else {
                    if (minServiceAssignment.device != -1 && (chosenAssignment.device == -1 || chosenAssignment.completionTime > minServiceAssignment.completionTime)) {
                        chosenAssignment = minServiceAssignment;
                    }
                }
            }

            if(chosenAssignment.device == -1)
                break;
            assignments.push(chosenAssignment);
            devices[chosenAssignment.device].assign(chosenAssignment.service);
        }

        return assignments;
    }

    static scheduleWorkQueue(devices: Device[], servicesCommunities: number[],  etc: number[][]) : Assignment[] {
        DemoScheduler.clearAssignments(devices);

        const assignments: Assignment[] = [];

        const services = Utils.shuffle([...Array(servicesCommunities.length).keys()]);

        for(let i = 0; i < services.length; i++) {
            const service = services[i];
            let minServiceAssignment = new Assignment(-1, service, -1, -1);
            devices.filter((device: { canRun: (arg0: any) => any; }) => device.canRun(servicesCommunities[service])).forEach((device: { workLoad: (arg0: any) => number; id: number; }) => {
                if(minServiceAssignment.device == -1 || devices[minServiceAssignment.device].workLoad(etc) > device.workLoad(etc)) {
                    minServiceAssignment = new Assignment(device.id, service, etc[device.id][service],  device.workLoad(etc) + etc[device.id][service]);
                }
            });
            if (minServiceAssignment.device != -1) {
                assignments.push(minServiceAssignment);
                devices[minServiceAssignment.device].assign(minServiceAssignment.service);
            }
        }

        return assignments;
    }

    static minCompletionTimes(service: number, servicesCommunities: number[], devices: Device[], etc: number[][]): Assignment {
        let minAssignment = new Assignment(-1, service, -1, -1);
        devices.filter(device => device.canRun(servicesCommunities[service]) && !device.assigned.includes(service)).forEach(device => {
            if(minAssignment.device == -1 || minAssignment.completionTime > etc[device.id][service] + device.workLoad(etc)) {
                minAssignment = new Assignment(device.id, service, etc[device.id][service],  etc[device.id][service] + device.workLoad(etc));
            }
        });
        
        return minAssignment;
    }

    static clearAssignments(devices: Device[]) {
        devices.forEach(device => device.clear());
    }

    static scheduleMunkres(devices: Device[], servicesCommunities: number[],  etc: number[][]) : Assignment[] {
        DemoScheduler.clearAssignments(devices);
        const assignments: Assignment[] = [];

        const unmappedServices: number[] = [...Array(servicesCommunities.length).keys()];

        const INF = 1000000000;

        const modEtc: number[][] = [];
        etc.forEach(deviceList => modEtc.push([...deviceList]));

        while (unmappedServices.length > 0) {
            const locations = munkres(modEtc);

            locations.filter((location: number[]) => devices[location[0]].canRun(servicesCommunities[location[1]]) && modEtc[location[0]][location[1]] < INF)
                    .forEach((location: number[]) => {
                        assignments.push(new Assignment(location[0], location[1], etc[location[0]][location[1]], etc[location[0]][location[1]]));
                        unmappedServices.splice(unmappedServices.indexOf(location[1]), 1);
                    });

            const mapped = locations.filter((location: number[]) => devices[location[0]].canRun(servicesCommunities[location[1]])).map((location: number[])  => location[1]);

            locations.filter((location: number[]) => modEtc[location[0]][location[1]] < INF).forEach((location: number[]) => {
                for (let i=0; i<servicesCommunities.length; i++) {
                    modEtc[location[0]][i] += etc[location[0]][location[1]];
                }
            });

            mapped.forEach((service: number) => {
                modEtc.forEach(deviceList => deviceList[service] = INF);
            })
        }

        return assignments;
    }

    static scheduleMinCostMaxFlow(etc: number[][], alpha: number = 1, serviceCap?: number) : Assignment[] {
        const INF = 1000000000;

        const n = etc.length + etc[0].length + 2;
        const cap: number[][] = [];
        const cost: number[][] = [];

        Utils.fill2D(cap, n, 0);
        Utils.fill2D(cost, n, 0);

        for(let i=0; i<etc.length; i++) {
            cap[0][i+1] = serviceCap ? serviceCap : n;
            for (let j=0; j<etc[i].length; j++) {
                if (etc[i][j] < INF) {
                    cap[i+1][j+etc.length+1] = 1;
                    cost[i+1][j+etc.length+1] = etc[i][j];
                    cost[j+etc.length+1][i+1] = -etc[i][j];
                }
                cap[j+etc.length+1][n-1] = 1;
            }
        }
        
        const assignments: Assignment[] = [];
        MinCostMaxFlow.mcmf(cap,cost,0,n-1,alpha);
        const deviceServices = [];
        for(let device=0; device<etc.length; device++) {
            const services = [];
            for (let service=0; service<etc[device].length; service++) {
                if (cap[service+etc.length+1][device+1] === 1) {
                    services.push(service);
                    assignments.push(new Assignment(device , service, etc[device][service], etc[device][service]));
                }
            }
            deviceServices.push(services);
        }

        // optimize more for makespan
        if (alpha >= 1) {
            for(let device=0; device<deviceServices.length; device++) {
                const services = deviceServices[device];
                if (services.length > 1) {
                    let sum = 0;
                    let moved = false;
                    for (let service of services) {
                        sum += etc[device][service];
                    }

                    for (let service of services) {
                        for(let altDevice=0; altDevice<deviceServices.length && !moved; altDevice++) {
                            if (deviceServices[altDevice].length == 0 && etc[altDevice][service] < sum) {
                                // console.log(services, service, device, altDevice, sum, etc[altDevice][service]);
                                assignments.push(new Assignment(altDevice , service, etc[altDevice][service], etc[altDevice][service]));
                                assignments.splice(assignments.findIndex(assignment => assignment.device == device && assignment.service == service), 1);
                                moved = true;
                            }
                        }
                        if (moved) {
                            break;
                        }
                    }
                }
            }
        }

        return assignments;
    }
        
    static isAllMatched(evaluation: Evaluation): boolean {
        return evaluation.matched === Number (evaluation.dataGroup.substring(0, evaluation.dataGroup.indexOf('-')));
    }
}