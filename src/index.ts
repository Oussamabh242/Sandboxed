import express, { Request, Response } from "express";
import bodyParser, { json } from "body-parser";
import cors from "cors";
import { createFile } from "./shared/fileCreate";
import { BASE_DIR } from "./globals";
import { runGateway } from "./judge/gateway";
import { submitGateway } from "./judge/gateway";
import Bottleneck from "bottleneck";
import { createProblem, getProblemInfo, getProblems } from "./shared/_db";

const limiter = new Bottleneck({
  minTime : 150,
  maxConcurrent : 5
})

const rateLimiter = (req:any , res:any , next : any)=>{
  limiter.schedule(()=>{

    return new Promise((resolve)=>{
      res.on("finish" , resolve) ; 
      next() ; 
    })
  })
}

const app = express()
const port = process.env.PORT || 3333 ; 

app.use(bodyParser.json()); 
app.use(cors()) ; 

app.post("/run" ,rateLimiter ,  async (req:Request,  res : Response) => {
  try{
    const {code ,  language , problemId } = req.body ;
    const problemInfo = await getProblemInfo(problemId) ; 
    const { order, testCases, functionName, execTime } = problemInfo;
    if (testCases.length === 0 || !testCases[0].input) {
      throw new Error("Invalid test cases format");
    }
    const runtestCases = testCases.slice(0,3) ; 
    const file = await createFile(
      language,
      code,
      BASE_DIR,
      functionName,
      Object.keys(runtestCases[0].input).length
    );
    const result = await runGateway(
      language,
      file,
      execTime,
      runtestCases,
      functionName,
      order
    );
    res.send(result) ; 
  }
  catch(err){
    console.log(err) ; 
    res.status(400).send("An error Occured") ; 
  }

}) ; 




 app.post("/submit" ,rateLimiter ,async(req: Request , res :Response)=>{
  try{
   const { code, language, problemId } = req.body;
   const problemInfo = await getProblemInfo(problemId);
   const { order, testCases, functionName, execTime } = problemInfo;
   if (testCases.length === 0 || !testCases[0].input) {
     throw new Error("Invalid test cases format");
   }
   const file = await createFile(
     language,
     code,
     BASE_DIR,
     functionName,
     Object.keys(testCases[0].input).length
   );
   const result = await submitGateway(
     language,
     file,
     execTime,
     testCases,
     functionName,
     order
   );
   res.send(result)	;
  }
  catch(err){
    console.log(err) ;
    res.status(400).send("An error Occured") ; 
  }
 })


app.post("/problem" , async (req, res)=>{
  try {
    const problem = await createProblem({...req.body , testCases : JSON.stringify(req.body.testCases)}) ; 
    res.status(201).json(problem) ; 
  }
  catch(err){
    console.log(err)
    res.status(500).send("Error Happend") ; 
  }

}); 

app.get("/problem" , async (req , res)=>{
  try {
    const problems =await getProblems() ; 
    res.json(problems) ; 
  }
  catch(err){
    console.error(err) ; 
    res.status(500).send("Error Happend")
  }
})

app.listen(port , ()=>{
    console.log("listenning on port " , port) ; 
})


