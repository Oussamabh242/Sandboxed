import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createFile ,deleteFile } from "./shared/fileCreate";
import { BASE_DIR } from "./globals";
import { runGateway } from "./judge/gateway";
import { submitGateway } from "./judge/gateway";


const app = express()
const port = process.env.PORT || 3333 ; 



app.use(bodyParser.json()); 
app.use(cors()) ; 

app.post("/run" , async (req:Request , res : Response) => {
    const {code , timeout , language ,functionName, tests } = req.body ;
    const file = createFile(language, code, BASE_DIR , functionName); 
    const result = await runGateway(language ,file , parseInt(timeout) , tests ) ; 
    res.send(result) ; 

}) ; 
 app.post("/submit" , async(req: Request , res :Response)=>{
   const {code ,  timeout , language  , functionName , tests} = req.body ; 
   const file = createFile(language ,code , BASE_DIR , functionName) ;
   const result = await submitGateway(language ,file,timeout ,tests) ; 
   res.send(result)	;
 })


app.listen(port , ()=>{
    console.log("listenning on port " , port) ; 
})
