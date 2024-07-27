import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createFile ,deleteFile } from "./shared/fileCreate";
import { BASE_DIR } from "./globals";
import { runGateway } from "./judge/gateway";
import { submitGateway } from "./judge/gateway";
import { parse } from "uuid";
import Bottleneck from "bottleneck";


const limiter = new Bottleneck({
  minTime : 100,
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
    const {code , timeout , language ,functionName, tests,order } = req.body ;
    const file = await createFile(language, code, BASE_DIR , functionName ,Object.keys(tests[0].input).length); 
    const result = await runGateway(language ,file , parseInt(timeout) , tests , functionName , parseInt(order)) ; 
    res.send(result) ; 

}) ; 



// submitGateway(language ,file,timeout ,tests , functionName).then(res=>console.log(res))

 app.post("/submit" ,rateLimiter ,async(req: Request , res :Response)=>{
   const {code ,  timeout , language  , functionName , tests , order} = req.body ; 
  
   const file =await  createFile(language ,code , BASE_DIR , functionName , Object.keys(tests[0].input).length) ;
   const result = await submitGateway(language ,file,timeout ,tests , functionName , parseInt(order)) ; 
   res.send(result)	;

 })


app.listen(port , ()=>{
    console.log("listenning on port " , port) ; 
})
