import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()

interface TestCase {
  input: any; // Define more specific types if you know the structure
  output: any; // Define more specific types if you know the structure
}

interface ProblemInfo {
  order: number;
  testCases: TestCase[];
  functionName: string;
  execTime: number;
}

interface CreateProblem {
  id: string;
  order: number;
  testCases: string ;
  functionName: string;
  execTime: number;
}

export async function getProblemInfo(problemId : string):Promise<ProblemInfo>{
  let res = await prisma.problem.findUnique({
    where : {
      id : problemId ,
    },
    select :{
      order : true ,
      testCases : true ,
      functionName : true ,
      execTime : true
    }
  }) ; 
  if(!res){throw new Error(`Problem with ID ${problemId} not found`);}

  return {...res , testCases : JSON.parse(res.testCases)}as ProblemInfo ; 
}

export async function createProblem({order , testCases , execTime , functionName , id} : CreateProblem) {
  const problem = await prisma.problem.create({
    data: {
      id : id ,
      testCases:testCases,
      functionName: functionName,
      order: order ,
      execTime: execTime
    },
  });
  return problem
}

