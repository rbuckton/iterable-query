const { Reflection, ReflectionKind } = require("typedoc/dist/lib/models");

exports.ifTest = function (v1, operator, v2, options) {
    return cond(v1, operator, v2) ? options.fn(this) : options.inverse(this);
};

const regExpPattern = /^\/(.*)\/([a-zA-Z]*)/;

function cond(v1, operator, v2) {
    switch (operator.toLowerCase()) {
        default: return false;
        case "==": return v1 == v2;
        case "===": return v1 === v2;
        case "!=": return v1 != v2;
        case "!==": return v1 !== v2;
        case "<": return v1 < v2;
        case "<=": return v1 <= v2;
        case ">": return v1 > v2;
        case ">=": return v1 >= v2;
        case "&&": return v1 && v2;
        case "||": return v1 || v2;
        case "in": return v1 in v2;
        case "typeof": return typeof v1 === v2;
        case "includes":
            return Array.isArray(v1) || typeof v1 === "string" ? v1.includes(v2) :
                v1 instanceof Set || v1 instanceof Map ? v1.has(v2) :
                v1 === v2;
        case "startswith":
            return Array.isArray(v1) ? v1.length > 0 && v1[0] === v2 :
                typeof v1 === "string" ? v1.startsWith(v2) :
                v1 === v2;
        case "endswith":
            return Array.isArray(v1) ? v1.length > 0 && v1[v1.length - 1] === v2 :
                typeof v1 === "string" ? v1.endsWith(v2) :
                v1 === v2;
        case "matches":
            if (v2 instanceof RegExp) return v2.test(v1);
            const str = String(v2);
            const match = regExpPattern.match(str);
            const re = match ? new RegExp(match[1], match[2]) : new RegExp(str);
            return re.test(v1);
        case "kindof":
            if (!(v1 instanceof Reflection)) return false;
            if (typeof v2 === "number") return v1.kindOf(v2);
            if (typeof v2 !== "string") return false;
            const array = v2.split(",").map(k => ReflectionKind[k.trim()]).filter(k => typeof k === "number");
            return array.length > 0 && v1.kindOf(array);
    }
}