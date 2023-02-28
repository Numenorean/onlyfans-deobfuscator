import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { readFileSync } from "fs";

function findConsts(ast: parser.ParseResult<t.File>, hashLength: number = 40): [number[], number[]] {
    const consts: number[] = [];
    const indexes: number[] = [];
    
    traverse(ast, {
        BinaryExpression(path) {
            const node = path.node;
            if (t.isNumericLiteral(node.right)) {
                const right = node.right as t.NumericLiteral;
                if (node.operator === '+') {
                    consts.push(right.value);
                } else if (node.operator === '-') {
                    consts.push(-right.value);
                } else {
                    console.error("Unhandler operator: ", node.operator);
                }
            } else if (t.isNumericLiteral(node.left) && node.operator === "%") {
                const left = node.left as t.NumericLiteral;
                indexes.push(left.value % hashLength);
            }
        }
    });

    return [consts, indexes];
}

const ast = parser.parse(readFileSync(process.argv[2], "utf8"));
const [consts, indexes] = findConsts(ast);
const total_const = consts.reduce((partialSum, a) => partialSum + a, 0);
console.log(`Consts: [${consts}]
Const: ${total_const}
Indexes: [${indexes}]`);
