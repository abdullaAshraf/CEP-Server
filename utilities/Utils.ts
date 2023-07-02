export default class Utils {
    static arrayIntersect(a: any[], b: any[]): boolean {
        return a.some(item => b.includes(item));
    }

    static shuffle(array: any[]) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
      
    static fill2D(array: any[][], n: number, value: any) {
      for(let i=0; i<n; i++){
        array.push([]);
        for(let j=0; j<n; j++) {
          array[i].push(value);
        }
    }
    }
}

