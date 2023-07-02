class edge {
    from : number;
    to: number
    w: number;
    constructor(from: number, to: number, w: number) {
        this.from = from;
        this.to = to;
        this.w = w;
    }
}

export class MinCostMaxFlow {
 static mcmf(cap: number[][], cost: number[][], src: number, dest:number, alpha: number = 1) : any {
        const OO = 1000000000;
        let maxFlow = 0, minCost = 0;

        while(true) {
            const edgeList: edge[] = [];
            for (let i=0; i<cap.length; i++) {
                for (let j=0; j<cap[i].length; j++) {
                    if(cap[i][j] > 0) {
                        edgeList.push(new edge(i, j, cost[i][j]));
                    }
                }
            }
            
            const {dist, path} = this.BellmanFord(edgeList, cap.length, src, dest);
            if(dist[dest] <= -OO || dist[dest] >= +OO) {
                break;
            }
    
            let bottleNeck = OO;
            for(let i = 0; i < path.length - 1; i++) {
                const f = path[i]
                const t = path[i+1];
                bottleNeck = Math.min(bottleNeck, cap[f][t]); 
            }

            for(let i = 0; i < path.length - 1; i++) {
                const f = path[i]
                const t = path[i+1];
                
                minCost += bottleNeck * cost[f][t];
                cap[f][t] -= bottleNeck;

                if (f != src && t != dest) {
                    const device = Math.min(f, t);

                    cap[t][f] += bottleNeck;
                    cost[src][device] += alpha * cost[f][t];                    
                }
            }

            maxFlow += bottleNeck;
        }
        return {maxFlow, minCost};
    }

    static BellmanFord(edgeList: edge[], n: number, src: number, dest: number) : any {
        const OO = 1000000000;

        let dist = new Array<number>(n).fill(OO);
        let prev = new Array<number>(n).fill(-1);
        const reachCycle = new Array<boolean>(n);
        let pos = new Array<number>(n);
        let path: number[] = [];
        dist[src] = 0;

        const cycle: boolean = this.BellmanProcessing(edgeList, n, dist, prev, pos);
        if(cycle) {
            const odist = [...dist];
            dist = new Array<number>(n).fill(OO);
            prev = new Array<number>(n).fill(-1);
            pos = new Array<number>(n);
            dist[src] = 0;
            this.BellmanProcessing(edgeList, n, dist, prev, pos);
            const cycle = [];
            for (let i = 0; i < n; ++i) { 	// find all nodes that AFFECTED by negative cycle
                reachCycle[i] = (odist[i] != dist[i]);
                if (reachCycle[i]) {
                    cycle.push(i);
                }
            }
            console.error(cycle);
            return {dist, path};
        } else {
            path = this.buildPath(prev, dest);
        }
    
        return {dist, path};
    }

    static BellmanProcessing(edgeList: edge[], n: number, dist: number[], prev: number[], pos: number[]): boolean {
        const OO = 1000000000;

        if(edgeList.length == 0) {
            return false;
        }
        for (let it = 0, r = 0; it < n+1; ++it, r = 0) {
            for (let j = 0; j < edgeList.length ; ++j) {
                const ne: edge = edgeList[j];
                if(dist[ne.from] >= OO || ne.w >= OO) {
                    continue;
                }
                if( dist[ne.to] > dist[ne.from] + ne.w ) {
                    dist[ne.to] = dist[ne.from] + ne.w;
                    prev[ ne.to ] = ne.from;
                    pos[ ne.to ] = j;
                    r++;
                    if(it == n) {
                        return true;
                    }
                }
            }
            if(!r) { 
                break;
            }
        }
        return false;
    }

    static buildPath(prev: number[], dest: number): number[] {
        const path = [];
        while(dest != -1) {
            path.unshift(dest);
            dest = prev[dest];
        }
        return path;
    }
}