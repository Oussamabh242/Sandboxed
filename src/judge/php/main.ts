import {spawnSync , spawn} from 'child_process' ; 
import path from 'path' ;
import { createFile, deleteFile } from '../../shared/fileCreate';
import { trimOutput } from '../../shared/utils';
import { BASE_DIR } from '../../globals';
import { compare } from '../../shared/utils';
import { check } from '../../shared/utils';


interface PhpResponse {
  stdout: string;
  stderr: string;
  message: string;
  result?: any | null;
  expected? : any 
  code? : number ,
  input? : any

}

interface Testcase {
    input : any
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




function execPhp(file : string , timeout : number , input :any) : Promise<PhpResponse> {
  return new Promise((resolve) => {
    const phpChild=  spawn("php", [file, JSON.stringify(input)], {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });
    const response: PhpResponse = { stdout: "", stderr: "", message: "" , code : 0 };
    const timer = setTimeout(() => {
      phpChild.kill();
      response.message = "Time Limit Exceeded";
      response.stderr = "Time Limit Exceeded";
      response.code = 1
      response.result = null;
    }, timeout * 1000);
    phpChild.stdout?.on("data", (data: any) => {
      response.stdout += data.toString();
    });
    phpChild.stderr?.on("data", (data) => {
      response.stderr += data.toString();
      response.result = null;
    });
    phpChild.on("error", (error) => {
      response.stderr += error.toString();
      response.code = 1
      response.result = null;
    });
    phpChild.on("exit", (code) => {
      clearTimeout(timer);
      const x = response.stdout.split("\n").filter((item) => item.trim());

      try {
        const res = x[x.length - 1];
        let y = JSON.stringify(res);
        response.result = JSON.parse(JSON.parse(y)).content;
        x.pop()
      } catch {
        response.result = null;
      }
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

export async function runPhp(file: string,timeout: number, tests: Testcase[] , order : number =1): Promise<PhpResponse[] >{
  try{
    let good = true ; let globalStderr = ""
    const arr : PhpResponse[] = [] ; 
    
    for(let i = 0 ; i<tests.length ; i++){
      if(good){
        const result = await execPhp(file , timeout ,tests[i].input  ) ; 
        result.expected = tests[i].output ; 
        check<PhpResponse>(result , tests[i].output, order);
        arr.push({...result , });   
        if(compare(result.code , 1, 1)){

          globalStderr = result.stderr ; 
          good = false ; 
        }
      }
      else{
        arr.push({result : null ,stdout : "" ,stderr : globalStderr , message :"wrong Answer"  , input:tests[i].input , expected :tests[i].output } as PhpResponse)
      }
     
    }
    return arr ; 
  } 
  finally{
    await deleteFile(file) ; 
  }
    
};



export async function submitPhp(file: string, timeout: number, tests: Testcase[], order: number = 1): Promise<SubmitResponse> {
  const subRes: SubmitResponse = { passed: 0 };

  try {
    for (let i = 0; i < tests.length; i++) {
      const { input, output } = tests[i];
      try {
        const res = await execPhp(file, timeout, input);
        if (!await compare(res.result, output, order)) {
          subRes.result = res.result;
          subRes.input = input;
          subRes.stderr = res.stderr;
          subRes.output = res.stdout;
          subRes.expected = output;
          subRes.message = "Wrong Answer";
          return subRes;
        } else {
          subRes.passed++;
        }
      } catch (err) {
        console.error(`Error executing PHP code for test case ${i}:`, err);
        subRes.message = "Execution Error";
        return subRes;
      }
    }
    subRes.message = "Accepted";
    return subRes;
  } finally {
    try {
      await deleteFile(file);
    } catch (err) {
      console.error(`Error deleting file ${file}:`, err);
    }
  }
}





const code = "$x =0 ;\nwhile($x<100){\n    echo $x;\n$x++;};\nfunction combinationSum($candidates, $target) {\n    $results = [];\n    function backtrack($start, $target, $path, &$results, $candidates) {\n        if ($target === 0) {\n            $results[] = $path;\n            return;\n        }\n        for ($i = $start; $i < count($candidates); $i++) {\n            if ($candidates[$i] > $target) continue;\n            backtrack($i, $target - $candidates[$i], array_merge($path, [$candidates[$i]]), $results, $candidates);\n        }\n    }\n    backtrack(0, $target, [], $results, $candidates);\n    return $results;\n}\n" ; 


const tests: Testcase[] = [
  {
    "input": {"arg1": [1, 2, 3, 4], "arg2": 5},
    "output":  [
       [ 2, 3 ],
    [ 1, 1, 1, 1, 1 ],
    [ 1, 1, 1, 2 ],
    [ 1, 1, 3 ],
    [ 1, 2, 2 ],
    [ 1, 4 ]
   
  ]
  },
  {
    "input": {"arg1": [7, 14, 21], "arg2": 14},
    "output": [[7, 7] , [14]]
  },
  {
    "input" : {"arg1":[2,3,4,5,6] , "arg2":5} , 
    "output" : [ [ 2, 3 ], [ 5 ] ] 
  }
]



//


