import {spawn} from 'child_process' ; 
import path from 'path' ;
import { deleteFile } from '../../shared/fileCreate';

interface PyResponse {
  stdout: string;
  stderr: string;
  message: string;
  result?: any | null;
  expected? : any
}

interface Response {
	result : any | null; 
	stdout : string
	message? : string
	stderr: string;
    expected? : any
}

interface Testcase {
    input : any[]
    output : any
}

function check(response : PyResponse , expected: any){
		if(response.result !== null){
				
			response.result===expected? response.message = "Accepted" : response.message = "Wrong Answer" ; 
		}

}
function execPython(file : string , timeout : number , input : any[]) : Promise<PyResponse> {
  return new Promise((resolve) => {
    const pyChild = spawn("python3", [file, ...input], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });
    const response: PyResponse = { stdout: "", stderr: "", message: "" };
    const timer = setTimeout(() => {
      pyChild.kill("SIGKILL");
      response.message = "Time Limit Exceeded";
      response.stderr = "Time Limit Exceeded";
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
      response.stdout = x.join("\n");
      resolve(response);
    });
  });
}


function trimFileName(errorMessage: string) {
  const regex = /^.*?\(\d+,\d+\):\s*/gm;
  return errorMessage.replace(regex, "");
}

export async function runPython(file: string,timeout: number, tests: Testcase[]): Promise<PyResponse[] >{
    const arr : PyResponse[] = [] ; 
    
    for(let i = 0 ; i<tests.length ; i++){
      const result = await execPython(file , timeout ,tests[i].input  ) ; 
      result.expected = tests[i].output ; 
      check(result , tests[i].output);
      arr.push(result);  
        }
     

    return arr ; 
};


