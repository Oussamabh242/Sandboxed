import { MAX_OUTPUT_SIZE } from "../globals";
export function trimOutput(output: string): string {
    if (output.length > MAX_OUTPUT_SIZE) {
        return output.substring(0, MAX_OUTPUT_SIZE) + "\n... [Output truncated]";
    }
    return output;
}


function deepEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }

  if (
    a == null ||
    b == null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  const keysA = Object.keys(a);
const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

interface Response {
  stdout: string;
  stderr: string;
  message: string;
  result?: any | null;
  expected? : any 
  code? : number ,
  input? : any

}


export function check<T extends Response>(response:T  , expected: any , order:number = 1){
    if(response.result !== null){
			compare(response.result , expected , order)? response.message = "Accepted" : response.message = "Wrong Answer" ; 
		}
}

export function compare(a: any, b: any, order:number =    1): boolean {
    if (Array.isArray(a) && Array.isArray(b)) {
        if (order === 0) {
            const containsAllElements = (arr1: any[], arr2: any[]) => 
                arr1.every(item1 => arr2.some(item2 => deepEqual(item1, item2)));

            return containsAllElements(a, b) && containsAllElements(b, a);
        } else {

            return deepEqual(a, b);
        }
    } else {
        return deepEqual(a, b);
    }
}

