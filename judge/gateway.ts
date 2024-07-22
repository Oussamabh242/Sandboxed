import { runPython } from "./python/main";
import { runTypescript } from "./typescript/main";
import {submitPython } from './python/main'
import {submitTypescript} from './typescript/main'


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

export async function submitGateway(language:string , file :string , timeout : number , testcases : any[]){
  switch (language) {
    case "python":
      return await submitPython(file ,timeout ,testcases); 
    case "typescript" :
      return await submitTypescript(file ,timeout ,testcases) ; 
  }
}
