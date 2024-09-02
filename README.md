# Sandboxed

# Introduction

This repository provides a Docker-based environment to run and test user-submitted code against predefined problems. It supports Python, TypeScript, Php by running each user submitted code as a child process ensuring a low latency time .

## How to Run

1. Clone the repository:
```bash
git clone https://github.com/Oussamabh242/Sandboxed.git
```

2. Navigate to the directory:

```bash
cd Sandboxed
```

3. Build the main contain:
   
```bash
docker build -t sandboxed .
docker run -p 3000:3000 sandboxed
```


## API Endpoints

The container has three endpoints:

### 1. POST /problem

Create a new problem with test cases.

**Request Body:**
```js
{
  id: string;
  order: number;
  testCases: []{
    input:{
      arg1 : val1, 
      arg2 : val2
    },
    output: any // expected restult 
  } ;
  functionName: string;
  execTime: number;
}
```

**Example:**

Valid Parenthesis Problem


```js
{
  "order": 1,
  "testCases": [
    {
      "input": {
        "arg1": "()"
      },
      "output": true
    },
    {
      "input": {
        "arg1": "()[]{}"
      },
      "output": true
    },
    {
      "input": {
        "arg1": "(]"
      },
      "output": false
    },
    {
      "input": {
        "arg1": "([)]"
      },
      "output": false
    },
    {
      "input": {
        "arg1": "{[]}"
      },
      "output": true
    }
  ],
  "functionName": "isValid",
  "execTime": 3
}


```

### 2. GET /problem 

Retrieve all the problems inside the database


### 3. POST /run && POST /submit

Run the code against the problem's test cases.

**Request Body:**
```js
{
  code: string,
  language: string,
  problemId: string
}
```

**Example:**

Submitting a solution in TypeScript

```js
{
  "code"": "function isValid(s: string): boolean {\n const stack: string[] = [];\n const mapping: { [key: string]: string } = {')': '(', '}': '{', ']': '['};\n \n for (const char of s) {\n if (char in mapping) {\n if (stack.length === 0 || stack[stack.length - 1] !== mapping[char]) {\n return false;\n }\n stack.pop();\n } else {\n stack.push(char);\n }\n }\n \n return stack.length === 0;\n}",

  "problemId": "4020f89d-b4e3-4625-8042-b452e32f8de4",

  "language": "typescript"
}
```

**Note:**

I used the swc compiler for typescript to increase performace but the tradeoffs are : 
1. sometimes you got some unreadable error unlike tsc 
2. less strictness than tsc
