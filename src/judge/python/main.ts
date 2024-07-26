import {spawn} from 'child_process' ; 
import path from 'path' ;
import { deleteFile } from '../../shared/fileCreate';
import { compare, trimOutput } from '../../shared/utils';
import { check } from '../../shared/utils';

interface PyResponse {
  stdout: string;
  stderr: string;
  message: string;
  result?: any | null;
  expected? : any 
  code? : number ,
  input? : any

}

interface Response {
	result : any | null; 
	stdout : string
	message? : string
	stderr: string;
    expected? : any ;
    input : any ;
    output : any
}

interface Testcase {
    input : any[]
    output : any
}

interface SubmitResponse {
		passed : number 
		input? : any 
		result? : any
		expected? : any
		output?: string
		stderr?: string 
		message?: string
}




function execPython(file : string , timeout : number , input :any) : Promise<PyResponse> {
  return new Promise((resolve) => {
    const pyChild = spawn("python3", [file, JSON.stringify(input)], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });
    const response: PyResponse = { stdout: "", stderr: "", message: "" , code : 0 };
    const timer = setTimeout(() => {
      pyChild.kill("SIGKILL");
      response.message = "Time Limit Exceeded";
      response.stderr = "Time Limit Exceeded";
      response.code = 1
      response.result = null;
    }, timeout * 1000);
    pyChild.stdout?.on("data", (data: any) => {
      response.stdout += data.toString();
    });
    pyChild.stderr?.on("data", (data) => {
      response.stderr += data.toString();
      response.result = null;
    });
    pyChild.on("error", (error) => {
      response.stderr += error.toString();
      response.code = 1
      response.result = null;
    });
    pyChild.on("exit", (code) => {
      clearTimeout(timer);
      const x = response.stdout.split("\n").filter((item) => item.trim());
      try {
        const res = x[x.length - 1];
        let y = JSON.stringify(res);
        response.result = JSON.parse(JSON.parse(y)).content;
      } catch {
        response.result = null;
      }
      x.pop();
      response.stdout = trimOutput(x.join("\n"));
      response.stderr = response.stderr.replace(/File ".*?", /g , "code.py ");
      resolve(response);
    });
  });
}


function trimFileName(errorMessage: string) {
  const regex = /^.*?\(\d+,\d+\):\s*/gm;
  return errorMessage.replace(regex, "");
}

export async function runPython(file: string,timeout: number, tests: Testcase[], order : number = 1): Promise<PyResponse[] >{
  try{
    let good = true ; let globalStderr = ""
    const arr : PyResponse[] = [] ; 
    
    for(let i = 0 ; i<tests.length ; i++){
      if(good){
        const result = await execPython(file , timeout ,tests[i].input  ) ; 
        result.expected = tests[i].output ; 
        check<PyResponse>(result , tests[i].output , order);
        arr.push({...result , });   
        if( compare(result.code , 1 , 1)){

          globalStderr = result.stderr ; 
          good = false ; 
        }
      }
      else{
        arr.push({result : null ,stdout : "" ,stderr : globalStderr , message :"wrong Answer"  , input:tests[i].input , expected :tests[i].output } as PyResponse)
      }
     
    }
    return arr ; 
  } 
  finally{
    await deleteFile(file) ; 
  }
    
};

export async function submitPython(file: string,timeout: number, tests: Testcase[] , order : number = 1){
  try{
    const subRes : SubmitResponse= { passed : 0  }  ; 
    for(let i = 0 ; i<tests.length ; i++){
      const {input , output} = tests[i] ;
      const res = await execPython(file,timeout,input ) ; 
      if (!compare(res.result , output , order)){
        subRes.result = res.result ; subRes.input = input ; subRes.stderr = res.stderr ;
        subRes.output = res.stdout , subRes.expected = output , subRes.message = "Wrong Answer" ;
        return subRes
      }
      else{
        subRes.passed++ ; 
      }
    }
    subRes.message = "Accepted" ;
    return subRes ; 
  }
  finally {
    deleteFile(file)

      }
}

