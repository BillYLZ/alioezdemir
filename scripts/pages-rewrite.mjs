#!/usr/bin/env node
// Static Export unter einem Unterpfad (GitHub Pages) lauffähig machen.
//
// Next setzt basePath nur für <Link>, _next/-Assets und Metadaten. Die Inhalte
// (content/site.json, praxis.ts, globals.css) verweisen aber absolut auf
// /files/... und /seite – das wird hier im fertigen out/ nachgezogen.
//
//   node scripts/pages-rewrite.mjs web_alt/out /alioezdemir/web_alt

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

const [dir, base] = process.argv.slice(2);
if (!dir || !base?.startsWith("/") || base.endsWith("/")) {
  console.error("usage: pages-rewrite.mjs <outDir> </base/path>");
  process.exit(1);
}

const EXT = new Set([".html", ".txt", ".css", ".js"]);

async function* walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (EXT.has(extname(e.name))) yield p;
  }
}

function rewrite(s) {
  return (
    s
      // "/files/…", '/files/…', url(/files/…) – auch in JSON/RSC-Payloads (\")
      .replace(/(["'(])\/files\//g, `$1${base}/files/`)
      // href="/seite" / src="/x" aus Rich-Text-HTML (auch escaped: href=\"/…)
      .replace(/((?:href|src)=\\*["'])\/(?!\/)/g, (m, pre, off, str) =>
        str.startsWith(base.slice(1), off + m.length) ? m : `${pre}${base}/`,
      )
  );
}

let n = 0;
for await (const f of walk(dir)) {
  const s = await readFile(f, "utf8");
  const r = rewrite(s);
  if (r !== s) {
    await writeFile(f, r);
    n++;
  }
}
console.log(`${dir}: ${n} Dateien auf ${base} umgeschrieben`);
