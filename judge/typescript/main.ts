import { spawn } from "child_process"; 
import { readFileSync , existsSync , unlinkSync, unlink, writeFileSync } from "fs" ; 
import test from "node:test";
import { stderr } from "process";
import { deleteFile , createFile } from '../../shared/fileCreate';
import { compare, trimOutput } from '../../shared/utils'; 


interface CompileRes {
  code : number ,
  stderr : string ,
  compiled : string , 
}

interface Testcase {
  input : any ; 
  output : any
}

interface ExecResponse {
	result? : any | null; 
	stdout? : string
	stderr?: string;
  code? : number
}

interface RunResponse extends ExecResponse {
  input? : any ; 
  expected? : any ;
  message? : string
}

interface SubmitResponse extends RunResponse {
  passed : number 
}

 function compile(file: string) : Promise<CompileRes> {
   return new Promise(async (resolve) => {
      let stderr: string = "";
      const compiledFilePath = file.substring(0 , file.length-2) +"js"
      const child = spawn("npx", ["tsc", file], {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
      });
      child.stdout?.on("data", (data : any) => {
        stderr += data.toString();
      });

      child.on("close", (code : any) => {
        let compiled = "";
        if (code === 0 && stderr.length === 0) {
          compiled = readFileSync(compiledFilePath).toString();
        }
        // unlinkSync(compiledFilePath);
        unlinkSync(file); //MTH F
        resolve({ code, stderr, compiled });
      });


   });
 }

async function writeCompiled(filePath : string, functionName : string) : Promise<{code: number , file : string , stderr? : string}>{
    const compiledFilePath = filePath.substring(0 , filePath.length-2)+"js" ; 
  const compileRes = await compile(filePath) ; 
  if( !compare(compileRes.code , 0 ,1) || compileRes.stderr.length>0){
    return {code: compileRes.code ,file : compiledFilePath , stderr: compileRes.stderr}
  }

  writeFileSync(compiledFilePath, writevm(compileRes.compiled , functionName)) ;
  // await deleteFile(filePath) ; 
  return {code : 0 , file :  compiledFilePath}
}

export async function execTypescript(compiledFile: string , timeout:number , input : any ): Promise<ExecResponse>{
		return new Promise(async (resolve)=>{
				const response :ExecResponse = { result: null ,stdout :"" ,  stderr:"" , code : 0   }  ;

				const child = spawn('node', [ compiledFile, JSON.stringify(input)], {
						stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
				        gid : 1000 ,
				        uid : 1000 
				});
				const timer = setTimeout(() => {
						response.stderr = "Time limit Exceeded";
            response.code = 1  ; 
						child.kill("SIGKILL");

				}, timeout*1000);

				child.stdout?.on('data', (data) => {
					response.stdout += data.toString()	 ;
				});

				child.stderr?.on('data', (data) => {
            response.code = 1 ; 
						response.stderr += data.toString();
				});

				child.on('message', (msg: any) => {
						if (compare(msg.type , 'result' , 1)) {
										response.result=msg.content ; 
		                  						}
				});

				child.on("error", (err : any) => {
						response.stderr+= err.toString()+'\n';
						child.kill("SIGTERM");
				});

				child.on('exit', (code) => {
          //if(compileRes.file) unlinkSync(compileRes.file) ; 
          if(response.stdout)response.stdout = trimOutput(response.stdout) ; 
					clearTimeout(timer);

		    resolve(response) ; 
		});
})} ;



export async function runTypescript(file: string, timeout: number, tests: Testcase[] , functionName : string , order: number):Promise<RunResponse[] >{
  const compiling = await writeCompiled(file , functionName) ;
  try{
    let good = true ; let globalStderr = "" ; 
    const arr : RunResponse[] = [] ; 
    
    if(!compare(compiling.code , 0 ,1) || compiling.stderr ){
      for(let i = 0 ; i< tests.length ; i++){
        arr.push({result : null , stderr : compiling.stderr ,message : "Compiling Error",stdout : "" , input : tests[i].input ,
      expected : tests[i].output} as RunResponse)  ;  
      }
      return arr ; 
    }
    for(let i = 0 ; i<tests.length ; i++){

      if(good){
        let res = await execTypescript(compiling.file , timeout , tests[i].input) 
        let msg ;
        if(compare(res.result , tests[i].output ,order )){msg = "Accepted"} else {msg = "Wrong Answer"} ; 
        arr.push({...res , input : tests[i].input ,expected : tests[i].output ,message :msg  }as RunResponse)
        if(!compare(res.code , 0, 1) && res.stderr){
          good = false  ; 
          globalStderr = res.stderr  ;
        }
      }
      else {
        arr.push({result : null , stderr : globalStderr  , input : tests[i].input ,expected : tests[i].output ,
          message :"Wrong Answer"  }as RunResponse)
      }
    
    } 
   return arr ; 
  }finally{
      await deleteFile(compiling.file)
  }
};


export async function submitTypescript(file:string , timeout:number , tests : Testcase[] ,functionName : string , order : number){
  const compiling = await writeCompiled(file , functionName) ;
  try {
  let subResponse : SubmitResponse = {passed: 0 } ; 
  if(!compare(compiling.code , 0, 1) || compiling.stderr){
    subResponse = {
      passed : 0 , 
      stderr : compiling.stderr , 
      input : tests[0].input ,
      expected :tests[0].output ,
      message : "Comiling eroor" 
    } ;
    return subResponse ; 
  }
  for(let i = 0 ; i<tests.length ; i++){
    const execRes = await execTypescript(compiling.file , timeout , tests[i].input) ; 
    if(!compare(execRes.result , tests[i].output , order)){
      subResponse = {
        passed : subResponse.passed ,
        ...execRes ,
        input : tests[i].input,
        expected: tests[i].output,
        message : "Wrong Answer"
      }
      return subResponse ; 
    }
    subResponse.passed++ ; 
  }
  subResponse.message= "Accepted" ;
  return subResponse  ; 
  }finally {
    await deleteFile(compiling.file) ; 
  }
}


const x : Testcase[] =[
    {
        "input": { "candidates": [2, 3, 6, 7], "target": 7 },
        "output": [[2, 2, 3] , [7]]
    },
    {
        "input": { "candidates": [2, 3, 5], "target": 8 },
        "output": [[2, 2, 2, 2], [2, 3, 3], [3, 5]]
    },
    {
        "input": { "candidates": [1], "target": 1 },
        "output": [[1]]
    },
    {
        "input": { "candidates": [1], "target": 2 },
        "output": [[1, 1]]
    },
    {
        "input": { "candidates": [2], "target": 1 },
        "output": []
    }
]

// submitTypescript("xxx.ts" ,5,x,0).then(res=>console.log(res))


const  writevm  = (code :string , functionName : string)=>{
  
return `
const ivm = require('isolated-vm');
const isolate = new ivm.Isolate({ memoryLimit: 50 });

function inputToArray() {
    const input = JSON.parse(process.argv[2]); 
    let out = [];

    for (const key in input) {

            out.push(input[key]);

    }
    return out;
} 
let tempin = inputToArray() ; 

let input = "" ; 
for (let i = 0; i < tempin.length; i++) {
  if (i == tempin.length - 1) {
    input += JSON.stringify(tempin[i]);
  } else {
    input += JSON.stringify(tempin[i]) + ", ";
  }
}

const code = 
\`
(()=>{

${code}`+ 
`return ${functionName}`+"(${input}) ;"+`
})()
\`
const context = isolate.createContextSync();

context.evalClosureSync(\`
  globalThis.console = {
    log: $0
  };
\`, [(...args)=>console.log(...args)]);

const jail = context.global;

jail.setSync('global', jail.derefInto());

const hostile = isolate.compileScriptSync(code);
hostile.run(context, { release: true, copy: true })
  .then((result)=> process.send({type :"result", content : result}))
`
}

