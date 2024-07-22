import path from "path";

export const BASE_DIR = path.resolve(__dirname, "..");
export const MAX_OUTPUT_SIZE = 0.1* 1024 * 1024;

const llpy = `
class LinkedList:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

    @classmethod
    def listToLinkedList(cls, listInput):
        if len(listInput) == 0:
            return None
        root = LinkedList(listInput[0])
        temp = root
        for i in range(1, len(listInput)):
            temp.next = LinkedList(listInput[i])
            temp = temp.next
        return root

    def toList(self):
        temp = self
        arr = []
        while temp:
            arr.append(temp.val)
            temp = temp.next
        return arr
`;

const treepy = `
class BinaryTree : 
    def __init__(self, val , right= None , left = None):
        self.val = val 
        self.left = left 
        self.right = right
    @classmethod 
    def listToBTree(cls , arr) : 
        if len(arr) == 0:
            return None
        nodes = []
        val = arr.pop(0)
        root = BinaryTree(val)
        nodes.append(root)
        while len(arr) > 0:
            curr = nodes.pop(0)
            left_val = arr.pop(0)
            if left_val is not None:
                curr.left = BinaryTree(left_val)
                nodes.append(curr.left)
            if len(arr) > 0:
                right_val = arr.pop(0)
                if right_val is not None:
                    curr.right = BinaryTree(right_val)
                    nodes.append(curr.right)
        return root
    
    def toList(self):
        if not self:
            return []

        result = []
        queue = [self]

        while queue:
            node = queue.pop(0)
            if node:
                result.append(node.val)
                queue.append(node.left)
                queue.append(node.right)
            else:
                result.append(None)

        while result and result[-1] is None:
            result.pop()

        return result


`; 


export const inputpy = `
import sys
import json
def inputToArray() :
    input = json.loads(sys.argv[1])
    out = []
    for i in input.keys() :
        # linked , tree
        if i == "linked":
            out.append(LinkedList.listToLinkedList(input[i]))
        elif i == "tree" : 
            out.append(BinaryTree.listToBTree(input[i]))
        else : 
            out.append(input[i])

    return out



def parse(output) : 
    temp = output
    if isinstance(output ,BinaryTree) or isinstance(output , LinkedList) : 
        temp = output.toList()
    temp_dict = {
        "type" : "result" , 
        "content" : temp
    }
    print(json.dumps(temp_dict))
`;
  export const dependecies = {
  linkedList : {
    python : llpy 
  } , 
  binaryTree : {
    python : treepy
  }
}
export const input = {
  python  : inputpy 
}
