import { runPython } from "./python/main";
import { runTypescript } from "./typescript/main";
import {submitPython } from './python/main'
import {submitTypescript} from './typescript/main'
import { runPhp, submitPhp } from "./php/main";


export async function runGateway(language : string , file : string , timeout :number , testcases : any[],functionName: string, order : number) {
  switch (language) {
    case "python":
      return await runPython(file , timeout , testcases,  order); 
     break; 
    case "typescript" :
      return await runTypescript(file , timeout , testcases , functionName, order) ;
    case "php":
      return await runPhp(file,timeout ,testcases , order) ; 
    default:
      break;
  }
}

export async function submitGateway(language:string , file :string , timeout : number , testcases : any[] , functionName : string , order : number){
  switch (language) {
    case "python":
      return await submitPython(file ,timeout ,testcases , order); 
    case "typescript" :
      return await submitTypescript(file ,timeout ,testcases , functionName , order) ; 
    case "php":
      return await submitPhp(file , timeout,testcases,order)

  }
}
