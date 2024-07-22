import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
// import { gateway } from "./Exec_Handler/runner";
import { createFile ,deleteFile } from "./shared/fileCreate";
import { BASE_DIR } from "./globals";
// import {runTest} from './Submit/submitter'
import { runGateway } from "./judge/gateway";
import {submit} from './judge/typescript/main'
const app = express()
const port = process.env.PORT || 3333 ; 



app.use(bodyParser.json()); 
app.use(cors()) ; 

app.post("/run" , async (req:Request , res : Response) => {
    const {code , timeout , language , tests} = req.body ;
    const file = createFile(language, code, BASE_DIR); 
    const result = await runGateway(language ,file , parseInt(timeout) , tests) ; 
    res.send(result) ; 

}) ; 
app.post("/submit" , async(req: Request , res :Response)=>{
  const {code ,  timeout , language  , functionName , tests} = req.body ; 
  const file = createFile(language ,code , BASE_DIR) ;
  const result = await submit(file , timeout , tests)
  res.send(result)	;

})


app.listen(port , ()=>{
    console.log("listenning on port " , port) ; 
})
