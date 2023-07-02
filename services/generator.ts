import Utils from "../utilities/Utils";

export default class Generator {
    static generate(numberOfService: number, numberOfDevices: number, numberOfCommunities: number, serviceHetro: number, deviceHetro: number, matrixConsistency: number, density: number) : any {
        const etc: number[][] = [];
        const devices: Device[] = [];
        const servicesCommunities: number[] = [];

        let allCommunities = [];
        for(let community = 0; community < numberOfCommunities; community++)
            allCommunities.push(community);

        const INF = 1000000000;

        const serviceRanges : number[][] = [];

        for (let service = 0; service < numberOfService; service++) {
            servicesCommunities.push(Generator.getRandomInteger(0, numberOfCommunities));
            serviceRanges.push([500, 500 + Generator.getRandomValue(0, 200) * serviceHetro]);
        }

        for (let device = 0; device < numberOfDevices; device++) {
            const deviceObj = new Device(device);
            devices.push(deviceObj);
            allCommunities = Utils.shuffle(allCommunities);
            for (let i = 0; i<density; i++) {
                deviceObj.joinCommunity(allCommunities[i]);
            }

            const mn = 500;
            const mx = 500 + Generator.getRandomValue(0, 200) * deviceHetro;

            const deviceList: number[] = [];
            for (let service = 0; service < numberOfService; service++) {

                const consistencyFactor = (200 / numberOfDevices) * (matrixConsistency > 0 ? device - service : Math.abs(device - service));

                if (deviceObj.canRun(servicesCommunities[service])) {
                    deviceList.push(Generator.getRandomValue(consistencyFactor + Math.max(mn, serviceRanges[service][0]), consistencyFactor + Math.min(mx, serviceRanges[service][1])));
                } else {
                    // Can't run this service because of community restrictions
                    deviceList.push(INF);
                }
            }

            etc.push(deviceList);
        }

        /*
        etc: a 2D array of estimated runtime for each service on each device. etc[i][j] is for running service j on device i.
        devices: list of all deice objects.
        servicesCommunities: 2D array, where each element is a list of communities that the service belong to.
        name: a unique string representation for the data generation parameters.
        */
        return  {
            etc: etc,
            devices: devices,
            servicesCommunities: servicesCommunities,
            name: [numberOfService, numberOfDevices, numberOfCommunities, serviceHetro, deviceHetro, matrixConsistency, density].join('-')
        }
    }

    static getTimeEstimation(device: number, service: number) {
        return Generator.getRandomValue(300,400); 
    }

    static getRandomValue(min: number, max: number) {
        return min + Math.random() * (max-min); 
    }

    static getRandomInteger(min: number, max: number) {
        return Math.floor(min + Math.random() * (max-min)); 
    }
}

export class Device {
    id: number;
    communities: number[] = [];
    assigned: number[] = [];

    constructor(id: number) {
        this.id = id;
    }

    joinCommunity(community: number) {
        this.communities.push(community);
    }

    canRun(community: number) : boolean {
        return this.communities.includes(community);
    }

    assign(service: number) {
        this.assigned.push(service);
    }

    clear() {
        this.assigned = [];
    }

    available() : boolean {
        return this.assigned.length === 0;
    }

    workLoad(etc: number[][]): number {
        let total = 0;
        this.assigned.forEach(service => total += etc[this.id][service]);
        return total;
    }
}