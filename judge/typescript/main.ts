import {spawn} from 'child_process' ; 
import path from 'path' ;
import { deleteFile } from '../../shared/fileCreate';
import { trimOutput } from '../../shared/utils'; 

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

interface CompileRes{
    code: number|null , 
    stderr : string
}

export function execTypescript(file:string , timeout:number , input:any[]): Promise<Response>{
		return new Promise((resolve , reject)=>{
				const response = { result: null , message:"",stdout :"" ,  stderr:""   }  ;

				const child = spawn('node', [ file ,...input], {
						stdio: ['pipe', 'pipe', 'pipe', 'ipc']
				});
				const timer = setTimeout(() => {
						response.stderr = "Time limit Exceeded";
						child.kill("SIGKILL");

				}, timeout*1000);

				child.stdout?.on('data', (data) => {
					response.stdout += data.toString()	 ;
				});

				child.stderr?.on('data', (data) => {
						response.stderr += data.toString();
				});

				child.on('message', (msg: any) => {
						if (msg.type === 'result') {
										response.result=msg.content ; 
								 
						}
				});

				child.on("error", (err : any) => {
						response.stderr+= err.toString()+'\n';
						child.kill("SIGTERM");
				});

				child.on('exit', (code) => {
						clearTimeout(timer);

				response.stdout = trimOutput(response.stdout) ; 
        response.stderr = trimOutput(response.stderr) ;
      resolve(response) ; 
		});
})

}

function trimFileName(errorMessage: string) {
  const regex = /^.*?\(\d+,\d+\):\s*/gm;
  return errorMessage.replace(regex, "");
}

export async function runTypescript(file: string, timeout: number, tests: Testcase[]): Promise<Response[] >{
    const arr : Response[] = [] ; 
    const res = await compile(file) ; 
    const compiledFile = file.substring(0 , file.length - 2)+"js";
    if(res.code != 0 && res.stderr.length>0){
        for(let i = 0 ; i<tests.length ; i++){
            arr.push({result : null  , stdout : "" , stderr : trimFileName(res.stderr) , message : "Compiling error" , expected : tests[i].output})   ; 

        }
    }

    else {
        for(let i = 0 ; i<tests.length ; i++){
            const result = await execTypescript(compiledFile , timeout ,tests[i].input  ) ; 
            result.expected = tests[i].output ; 
            check(result , tests[i].output);
            arr.push(result);  
        }
    }
    deleteFile(compiledFile) ; 
    deleteFile(file) ;
    return arr
};

function check(response : Response , expected: any){
		if(response.result !== null){
				
			response.result===expected? response.message = "Accepted" : response.message = "Wrong Answer" ; 
		}

}

// async function run(file :string , timeout:number , input: any[]){
// 		const response = await runTypescript(file ,timeout  , input ) ; 
// 		check(response , 3) ; 
// 		return response 
// }

interface SubmitResponse {
		passed : number 
		input? : any 
		result? : any
		expected? : any
		output?: string
		stderr?: string 
		message?: string
}

 function compile(file: string):  Promise<CompileRes> {
   return new Promise((resolve, reject) => {

     let stderr: string = "";
     const child = spawn("npx", ["tsc", file], {
       stdio: ["pipe", "pipe", "pipe", "ipc"],
     });
     child.stdout?.on("data", (data) => {
       stderr += data.toString();
     });

     child.on("close", (code) => {
        stderr = trimFileName(stderr)
        resolve({ code, stderr }as CompileRes );
     });
   });
 }


export async function submit(file :string , timeout :number, testcases: Testcase[]){
		const subRes : SubmitResponse= { passed : 0  }  ;
    const res = await compile(file) ; 
    const compiledFile = file.substring(0 , file.length - 2)+"js";
  try{
    if(res.code != 0 && res.stderr.length>0){
    subRes.stderr = res.stderr ; 
    subRes.message = "Wrong Answer" ;
    subRes.input = testcases[0].input ; 
    subRes.expected = testcases[0].output ; 
    return subRes ; 
   }
		for(let i = 0  ; i<testcases.length ; i++){
				const response = await execTypescript(compiledFile , timeout , testcases[i].input) ;

				if(response.result === testcases[i].output){
						subRes.passed++ ; 
				}
				else {
						subRes.result = response.result ; subRes.expected = testcases[i].output ; subRes.output = response.stdout
						subRes.input = testcases[i].input ; subRes.stderr = response.stderr ; subRes.message = "Wrong Answer" ; 
						return subRes ; 
				}
		}
		subRes.message = "Accepted" ;

		return subRes ; 
  }
  finally{
    await Promise.all([
            deleteFile(compiledFile),
            deleteFile(file)
        ]);
  }
}

const tests = [
    {
        input: [2 , 5],
        output: 7,
    },
    {
        input: [1 , 1000],
        output:1001 
    },
    {
        input: [5, 5],
        output: 11
    }
];

// submit(childPath , 3000 , tests)
//   .then(res=>{
// 			console.log(res) ; 
// 	})

// runTypescript(
//   "/home/oussamabh242/Mine/Custom/JS/sandbox2/user_code/cad49132-854a-47dc-9c27-a4182b7af30a.ts",
//   3,
//   tests
// ).then((res) => {
//   console.log(res);
// });
