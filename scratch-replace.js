const fs = require("fs"); const path = require("path");
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes("node_modules") && !file.includes(".git") && !file.includes(".next") && !file.includes("dist")) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".json") || file.endsWith(".md") || file.includes(".env")) {
        results.push(file);
      }
    }
  });
  return results;
}
const files = walk("./");
let changed = 0;
for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const orig = content;
  content = content.replace(/FormCraft/g, "AuraForm");
  content = content.replace(/Formcraft/g, "AuraForm");
  content = content.replace(/formcraft/g, "auraform");
  if (content !== orig) {
    fs.writeFileSync(file, content, "utf8");
    changed++;
  }
}
console.log(`Updated ${changed} files.`);

