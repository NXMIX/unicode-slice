// Packages
import ansiStyles = require("ansi-styles");

// Utilities
import matchEmoji from "@nxmix/emoji-seq-match";

const ESCAPE = "\u001B";
const ESCRE = /\x1b\[((?:\d*)(?:;\d*)*)(?:m)/;

const wrapAnsi = (escCode: string) => `${ESCAPE}[${escCode}m`;
const getEndCode = (escCode: string) => {
  if (escCode.startsWith("38")) {
    return "39";
  } else if (escCode.startsWith("48")) {
    return "49";
  } else {
    return (ansiStyles.codes.get(parseInt(escCode, 10)) || "39").toString();
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

  let visible = 0;
  let tmp = "";

  const root = new Node();
  let current = root;
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x === ESCAPE) {
      const escSeq = arr.slice(i, Math.min(i + 32, arr.length)).join("");
      const m = escSeq.match(ESCRE);
      if (m) {
        // 如果匹配上，就直接提取 code
        const escapeCode = m[1];
        if (!current.code) {
          if (tmp) {
            // tslint:disable-next-line no-unused-variable
            const newNode = new Node(current, undefined, tmp);
            tmp = "";
          }
          current = new Node(current, escapeCode);
        } else {
          if (tmp) {
            // tslint:disable-next-line no-unused-variable
            const newNode = new Node(current, undefined, tmp);
            tmp = "";
          }
          if (escapeCode === getEndCode(current.code)) {
            // close current node then move up
            current = current.parent!;
          } else {
            // create a new child node then set it as current
            current = new Node(current, escapeCode);
          }
        }
        i += m[0].length - 1;
        continue;
      }
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

    out = out + node.text || "";
    if (node.type === "code") {
      out = wrapAnsi(node.code!) + out + wrapAnsi(getEndCode(node.code!));
    }
    return out;
  };
  return iter(root);
};

export default slice;
