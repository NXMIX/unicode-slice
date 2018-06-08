// Native
import { inspect } from "util";

// Packages
import ansiStyles = require("ansi-styles");

// Utilities
import matchEmoji from "@nxmix/emoji-seq-match";

const ESCAPES = ["\u001B", "\u009B"];

const wrapAnsi = (escCode: string) => `${ESCAPES[0]}[${escCode}m`;
const getEndCode = (escCode: string) => {
  if (escCode.startsWith("38")) {
    return "39";
  } else if (escCode.startsWith("48")) {
    return "49";
  } else {
    return ansiStyles.codes.get(parseInt(escCode, 10)).toString();
  }
};

class Node {
  parent: Node | undefined = undefined;
  children: Node[] = [];
  code?: string;
  text?: string;
  type: "code" | "text";

  constructor(parent?: Node, code?: string, text?: string) {
    this.parent = parent;
    this.children = [];
    this.code = code;
    this.text = text || "";
    this.type = code ? "code" : "text";
    if (parent) {
      parent._append(this);
    }
  }

  _append(node: Node) {
    this.children.push(node);
  }
}

const slice = (str: string, begin: number, end?: number) => {
  const arr = [...str.normalize()];
  end = typeof end === "number" ? end : arr.length;

  if (begin < 0 || end < 0) {
    throw new Error("Parameters 'begin' and 'end' do not support negative values");
  }

  let insideEscape = false;
  let escapeCode;
  let visible = 0;
  let tmp = "";

  const root = new Node();
  let current = root;
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (ESCAPES.includes(x)) {
      insideEscape = true;
      escapeCode = /\d[^m]*/.exec(str.slice(i, i + 32))[0];
      continue;
    } else if (insideEscape) {
      if (x === "m") {
        if (!current.code) {
          if (tmp) {
            const newNode = new Node(current, undefined, tmp);
            tmp = "";
          }
          const newNode = new Node(current, escapeCode);
          current = newNode;
        } else {
          if (tmp) {
            const newNode = new Node(current, undefined, tmp);
            tmp = "";
          }
          if (escapeCode === getEndCode(current.code)) {
            current = current.parent;
          } else {
            const newNode = new Node(current, escapeCode);
            current = newNode;
          }
        }
        insideEscape = false;
      }
      continue;
    }

    visible += 1;

    const matchedLength = matchEmoji(arr, i);
    if (matchedLength === 0) {
      if (visible > begin && visible <= end) {
        tmp += x;
      }
    } else {
      if (visible > begin && visible <= end) {
        for (let j = 0; j < matchedLength; j++) {
          tmp += arr[i + j];
        }
      }
      i += matchedLength - 1;
    }
  }
  current.text = tmp;

  const iter = (node: Node) => {
    let out = "";

    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      out += iter(children[i]);
    }

    if (node.type === "code") {
      out = wrapAnsi(node.code!) + out + wrapAnsi(getEndCode(node.code!));
    } else {
      out = out + node.text || "";
    }
    return out;
  };
  return iter(root);
};

export default slice;
