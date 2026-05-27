import fs from "fs"; import path from "path";
function walk(dir: string) {
  let results: string[] = [];
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
  content = content.replace(/AuraForm/g, "AuraForm");
  content = content.replace(/AuraForm/g, "AuraForm");
  content = content.replace(/auraform/g, "auraform");
  if (content !== orig) {
    fs.writeFileSync(file, content, "utf8");
    changed++;
  }
}
console.log(`Updated ${changed} files.`);

