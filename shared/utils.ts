import { MAX_OUTPUT_SIZE } from "../globals";
export function trimOutput(output: string): string {
    if (output.length > MAX_OUTPUT_SIZE) {
        return output.substring(0, MAX_OUTPUT_SIZE) + "\n... [Output truncated]";
    }
    return output;
}
