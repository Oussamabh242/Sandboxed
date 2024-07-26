import{ writeFileSync  , existsSync ,mkdirSync} from "fs";
import { promises as fsPromises } from 'fs';
import {unlink } from 'fs/promises'
import path from "path";
import { v4 as uuid } from "uuid";
import { BASE_DIR } from "../globals";
import { input} from '../globals'
import { dependecies } from "../globals";
const { mkdir, writeFile } = fsPromises;


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

function formatCode(language : string , code:string , functionName:string , inputNumber : number) : string{
  switch (language) {
    case "python":
      return formulatePython(code , functionName)  ; 
    case "typescript" :
      return formulateTypeScript(code)  ;
    case "php":
      return formulatePhp(code , functionName , inputNumber) ;
    default :
      throw Error("Wrong Language ")
  }
}

export async function createFile(language: string, code: string , directory :string, functionName:string , inputNumber :number) {
    const folder = `${directory}/user_code`;
  const id = uuid();
  const fileName = id + extension(language);
  const filePath = path.join(folder, fileName);
  try {
    // Ensure the directory exists
    if (!await fsPromises.stat(folder).catch(() => false)) {
      await mkdir(folder, { recursive: true });
    }
    
    // Write the file asynchronously
    await writeFile(filePath, formatCode(language, code, functionName, inputNumber));
    
    return filePath;
  } catch (error) {
    console.error("Error creating file:", error);
    throw error; 
  }}

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
const formulateTypeScript = (code: string)=>{
/*  let modedCode = input.typescript +"\n"+stripImports(code)+"\n"+ `

   parse(twoSum(...(inputToArray() as [any , any])));

` 
  return modedCode ;*/

  return code ; 
} 


function formulatePhp(code : string , functionName : string , inputNumber : number) {
  let x = "" ; 
  for(let i = 0 ; i<inputNumber ; i++) { 
    if(i !== inputNumber -1){
        x+= `$arg[${i}] , ` ; 
    }else {
      x+= `$arg[${i}]` ; 
    }
  }
  return`

<?php

require_once('vendor/autoload.php');


$arg = $argv[1];

function insertJsonValuesIntoArray($jsonString) {
    $data = json_decode($jsonString, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new InvalidArgumentException("Invalid JSON string.");
    }
    $resultArray = [];
    foreach ($data as $key => $value) {            $resultArray[] = $value;    }

    return $resultArray;
}

$arg= insertJsonValuesIntoArray($argv[1]);

$options = [
   'allow_functions' => true,
    'allow_constants' => true,
    'allow_closures' => true,
    'allow_aliases' => true,
    'allow_brackets' => true,
    'allow_static_variables' => true,
]; 
echo "supppppppppp" ;

$blocked_functions = [ 
    'exec', 'shell_exec', 'system', 'passthru', 'popen', 'proc_open',
    'pcntl_exec', 'assert', 'create_function', 'include', 'include_once',
    'require', 'require_once', 'phpinfo', 'posix_mkfifo', 'posix_getlogin',
    'posix_ttyname', 'getenv', 'get_current_user', 'proc_get_status', 'get_cfg_var',
    'disk_free_space', 'disk_total_space', 'diskfreespace', 'getcwd', 'getlastmo',
    'getmygid', 'getmyinode', 'getmypid', 'getmyuid', 'unlink', 'rmdir', 'chmod',
    'chown', 'copy', 'rename', 'move_uploaded_file', 'file_put_contents', 'file_get_contents',
    'fopen', 'fwrite', 'file', 'fileatime', 'filectime', 'filegroup', 'fileinode',
    'filemtime', 'fileowner', 'fileperms', 'filesize', 'filetype', 'glob', 'is_dir',
    'is_executable', 'is_file', 'is_link', 'is_readable', 'is_writable', 'is_writeable',
    'linkinfo', 'lstat', 'parse_ini_file', 'pathinfo', 'readfile', 'readlink',
    'realpath', 'symlink', 'tempnam', 'tmpfile', 'touch', 'pcntl_fork', 'pcntl_alarm',
    'pcntl_exec', 'pcntl_getpriority', 'pcntl_setpriority', 'pcntl_signal',
    'pcntl_signal_dispatch', 'pcntl_sigprocmask', 'pcntl_sigtimedwait', 'pcntl_sigwaitinfo',
    'pcntl_wait', 'pcntl_waitpid', 'pcntl_wexitstatus', 'pcntl_wifexited', 'pcntl_wifsignaled',
    'pcntl_wifstopped', 'pcntl_wstopsig', 'pcntl_wtermsig', 'pthread_create',
    'pthread_join', 'pthread_detach', 'pthread_equal', 'pthread_self', 'pthread_exit',
    'pthread_mutex_init', 'pthread_mutex_destroy', 'pthread_mutex_lock', 'pthread_mutex_unlock',
    'pthread_cond_init', 'pthread_cond_destroy', 'pthread_cond_signal', 'pthread_cond_broadcast',
    'pthread_cond_wait'
];



$sandbox = \\PHPSandbox\\PHPSandbox::create($options);
foreach ($blocked_functions as $func) {
    $sandbox->blacklistFunc($func);
}

$sandbox->defineVar('arg' , $arg)  ;
$result = $sandbox->execute(function() {
  ${code} 
  return ${functionName}(${x}); 
});

echo "\n" . json_encode([
    'type' => "result",
    'content' => $result 
]);

?>
` 
}


