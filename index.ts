import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createFile ,deleteFile } from "./shared/fileCreate";
import { BASE_DIR } from "./globals";
import { runGateway } from "./judge/gateway";
import { submitGateway } from "./judge/gateway";
import { parse } from "uuid";


const app = express()
const port = process.env.PORT || 3333 ; 

let num = 0 ; 

app.use(bodyParser.json()); 
app.use(cors()) ; 

app.post("/run" , async (req:Request , res : Response) => {
    const {code , timeout , language ,functionName, tests,order } = req.body ;
    const file = await createFile(language, code, BASE_DIR , functionName ,Object.keys(tests[0].input).length); 
    const result = await runGateway(language ,file , parseInt(timeout) , tests , functionName , parseInt(order)) ; 
    res.send(result) ; 

}) ; 



// submitGateway(language ,file,timeout ,tests , functionName).then(res=>console.log(res))

 app.post("/submit" , async(req: Request , res :Response)=>{
   const {code ,  timeout , language  , functionName , tests , order} = req.body ; 
  
   const file =await  createFile(language ,code , BASE_DIR , functionName , Object.keys(tests[0].input).length) ;
   const result = await submitGateway(language ,file,timeout ,tests , functionName , parseInt(order)) ; 
   res.send(result)	;

 })


app.listen(port , ()=>{
    console.log("listenning on port " , port) ; 
})
