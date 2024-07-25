
import sys
import json
import builtins
from pyseccomp import *
def setup_seccomp():
    f = SyscallFilter(defaction=ALLOW)
    f.add_rule(ERRNO(1), "execve")
    f.add_rule(ERRNO(1), "execveat")
    f.add_rule(ERRNO(1), "fork")
    f.add_rule(ERRNO(1), "vfork")
    f.add_rule(ERRNO(1), "clone")
    f.add_rule(ERRNO(1), "unlink")
    f.add_rule(ERRNO(1), "unlinkat")
    f.add_rule(ERRNO(1), "rmdir")
    f.add_rule(ERRNO(1), "mkdir")
    f.add_rule(ERRNO(1), "mount")
    f.add_rule(ERRNO(1), "umount2")
    f.add_rule(ERRNO(1), "pivot_root")
    f.add_rule(ERRNO(1), "chroot")
    f.add_rule(ERRNO(1), "reboot")
    f.add_rule(ERRNO(1), "ptrace")
    f.add_rule(ERRNO(1), "kexec_load")
    f.add_rule(ERRNO(1), "create_module")
    f.add_rule(ERRNO(1), "init_module")
    f.add_rule(ERRNO(1), "delete_module")
    f.add_rule(ERRNO(1), "iopl")
    f.add_rule(ERRNO(1), "ioperm")
    f.add_rule(ERRNO(1), "swapon")
    f.add_rule(ERRNO(1), "swapoff")
    f.load()
setup_seccomp()
def evil(*args, **kwargs):
    raise PermissionError("Function not allowed")
builtins.eval= evil
builtins.open = evil
original_import = builtins.__import__
builtins.__import__= evil


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
    try : 
        print(json.dumps(temp_dict))
    except err : 
        print("Invalid return Type" , file = sys.stderr)

while True :
    print('sup')
def length_of_longest_substring(s: str) -> int:
    max_length = 0
    start = 0
    seen = {}

    for end, char in enumerate(s):
        if char in seen:
            start = max(seen[char] + 1, start)
        seen[char] = end
        max_length = max(max_length, end - start + 1)
    
    return max_length

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



parse(lengthOfLongestSubstring(*inputToArray()))