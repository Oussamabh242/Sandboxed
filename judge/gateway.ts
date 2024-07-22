import { runPython } from "./python/main";
import { runTypescript } from "./typescript/main";


export async function runGateway(language : string , file : string , timeout :number , testcases : any[]  ) {
  switch (language) {
    case "python":
      return await runPython(file , timeout , testcases); 
     break; 
    case "typescript" :
      return await runTypescript(file , timeout , testcases) ; 
    default:
      break;
  }
}


