/* Fails if a shared module puts a star amount, price, or balance
   into a request the server might trust. Run: node tests/client-safety.test.js */
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var FORBIDDEN = ["amount", "balance", "price", "delta", "stars", "cost", "score"];
var FILES = [
  "stars/stars.js",
  "practice/practice.js",
  "level-test/level-test.js",
  "level-test/store.js",
  "books/client.js",
  "books/books.js",
  "homework/client.js",
  "homework/homework.js",
  "chat/chat.js"
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

function objectAt(src, braceIndex) {
  var depth = 0;
  var i;
  for (i = braceIndex; i < src.length; i++) {
    if (src[i] === "{") depth += 1;
    else if (src[i] === "}") {
      depth -= 1;
      if (depth === 0) return src.slice(braceIndex, i + 1);
    }
  }
  return "";
}

function topKeys(objText) {
  var flat = objText.slice(1, -1).replace(/\{[^{}]*\}/g, " ").replace(/\[[^\[\]]*\]/g, " ");
  var keys = [];
  var re = /([A-Za-z_][A-Za-z0-9_]*)\s*:/g;
  var match;
  while ((match = re.exec(flat))) keys.push(match[1]);
  return keys;
}

function collect(src) {
  var found = [];
  var assign = /\b(?:var|let|const)\s+(?:body|payload)\s*=\s*\{/g;
  var match;
  while ((match = assign.exec(src))) {
    var brace = src.indexOf("{", match.index);
    found.push(objectAt(src, brace));
  }
  var call = /\b(?:post|call|quiet|postJson|api)\s*\(/g;
  while ((match = call.exec(src))) {
    var windowEnd = src.indexOf(";", match.index);
    if (windowEnd < 0) windowEnd = Math.min(src.length, match.index + 500);
    var slice = src.slice(match.index, windowEnd);
    var braceRel = slice.indexOf("{");
    if (braceRel < 0) continue;
    found.push(objectAt(src, match.index + braceRel));
  }
  return found;
}

var problems = [];

FILES.forEach(function (rel) {
  var src = stripComments(read(rel));
  collect(src).forEach(function (obj) {
    topKeys(obj).forEach(function (key) {
      if (FORBIDDEN.indexOf(key) !== -1) {
        problems.push(rel + " sends " + key + " in " + obj.replace(/\s+/g, " ").slice(0, 160));
      }
    });
    if (rel !== "chat/chat.js" && /\bpasscode\s*:/.test(obj)) {
      problems.push(rel + " sends a passcode");
    }
  });
  if (/\b(?:body|payload)\.(?:amount|balance|price|delta|stars|cost|score)\s*=/.test(src)) {
    problems.push(rel + " assigns a forbidden field onto a request");
  }
  if (/hwmock/.test(src)) problems.push(rel + " still has a homework pass switch");
});

var settings = read("settings.js");
if (!/server enforces the real prices/i.test(settings)) {
  problems.push("settings.js does not say the server enforces prices");
}
if (!/cannot create stars/i.test(settings)) {
  problems.push("settings.js does not say editing it cannot create stars");
}
if (!/localStorage/i.test(settings)) {
  problems.push("settings.js does not mention localStorage");
}

var readme = read("README.md");
if (!/## Safety rules/.test(readme)) problems.push("README is missing Safety rules");

if (problems.length) {
  problems.forEach(function (line) { console.error(line); });
  process.exit(1);
}

console.log("Client safety checks passed (" + FILES.length + " files, no forbidden request fields).");
