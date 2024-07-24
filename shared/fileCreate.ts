import{ writeFileSync  , existsSync ,mkdirSync} from "fs";
import {unlink} from 'fs/promises'
import path from "path";
import { v4 as uuid } from "uuid";
import { BASE_DIR } from "../globals";
import { input} from '../globals'
import { dependecies } from "../globals";

function stripImports(code: string) {
  code = code.replace(/^\s*(import\s.*;|\s*import\s.*from\s.*;)\s*$/gm, "console.log('importing is prevented')");

  code = code.replace(
    /^\s*(const\s.*=\s*require\(.*\);|\s*var\s.*=\s*require\(.*\);)\s*$/gm,
    "console.log('importing is prevented')"
  );

  return code;
}


function extension(language: string): string {
  switch (language) {
    case "python":
      return ".py";

    case "typescript":
      return ".ts";

    case "php" :
      return '.php'
    default:
      throw new Error("language must be ");
  }
}

function formatCode(language : string , code:string , functionName:string) : string{
  switch (language) {
    case "python":
      return formulatePython(code , functionName)  ; 
    case "typescript" :
      return formulateTypeScript(code , functionName)  ;
    default:
      throw Error("Wrong Language ")
  }
}

export function createFile(language: string, code: string , directory :string, functionName:string) {
    const folder = `${directory}/user_code`;
  const id = uuid();
  const fileName = id + extension(language);
  const filePath = path.join(folder, fileName);
  try {
    if (!existsSync(folder)) {
      mkdirSync(folder, { recursive: true });
    }
    writeFileSync(filePath,formatCode(language ,code ,functionName));
    return filePath;
  } catch (error) {
    console.error("error :", error);
    throw error; 
  }
}

export async function deleteFile(filePath:string) {
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
}

const formulatePython = (code: string , functionName : string) =>{
  let modedCode = input.python+"\n" + code+"\n" + dependecies.linkedList.python+"\n" + dependecies.binaryTree.python+"\n" + `parse(${functionName}(*inputToArray()))` ; 
  return modedCode
}
const formulateTypeScript = (code: string , functionName : string)=>{
  let modedCode = input.typescript +"\n"+stripImports(code)+"\n"+ `

   parse(twoSum(...(inputToArray() as [any , any])));

` 
  return modedCode ;
}
