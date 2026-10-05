#!/usr/bin/env node
/**
 * Contao DB (oezdemir-die-praxis) -> content/site.json + public/files/
 *
 * Kullanim:
 *   DB_PASS=$(docker exec amp-db83-1 printenv MYSQL_ROOT_PASSWORD) node scripts/export-contao.mjs
 *
 * Env: DB_HOST (172.21.0.2), DB_USER (root), DB_PASS, DB_NAME (oez_praxis),
 *      FILES_ROOT (orijinal Contao kurulumu; files/ klasoru burada)
 */
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const FILES_ROOT =
  process.env.FILES_ROOT ??
  "/varyit/www83/alioezdemir/letzte-live-oezdemir/oezdemir-die-praxis";
const OUT_JSON = path.join(ROOT, "content", "site.json");
const OUT_FILES = path.join(ROOT, "public");
// yayinlanmamasi gereken klasorler (DB yedekleri, editor sablonlari)
const SKIP_FILES = [/^files\/AutoBackupDB\//, /^files\/tiny_templates\//, /\.less$/, /tinymce\.css$/];

// ------------------------------------------------------------ PHP unserialize

function unserialize(buf) {
  if (buf == null) return null;
  if (!Buffer.isBuffer(buf)) buf = Buffer.from(String(buf), "utf8");
  if (buf.length === 0) return null;
  let i = 0;
  const readUntil = (ch) => {
    const j = buf.indexOf(ch, i);
    const s = buf.toString("latin1", i, j);
    i = j + 1;
    return s;
  };
  const parse = () => {
    const t = String.fromCharCode(buf[i]);
    i += 2; // "x:"
    switch (t) {
      case "N":
        return null;
      case "b":
        return readUntil(";") === "1";
      case "i":
        return parseInt(readUntil(";"), 10);
      case "d":
        return parseFloat(readUntil(";"));
      case "s": {
        const len = parseInt(readUntil(":"), 10);
        i += 1; // "
        const raw = buf.subarray(i, i + len);
        i += len + 2; // ";
        return raw;
      }
      case "a": {
        const n = parseInt(readUntil(":"), 10);
        i += 1; // {
        const out = {};
        for (let k = 0; k < n; k++) {
          let key = parse();
          if (Buffer.isBuffer(key)) key = key.toString("utf8");
          out[key] = parse();
        }
        i += 1; // }
        return out;
      }
      default:
        throw new Error(`unserialize: tip ${t} @${i}`);
    }
  };
  try {
    i = 0;
    return parse();
  } catch {
    return null;
  }
}

const str = (v) => (Buffer.isBuffer(v) ? v.toString("utf8") : v == null ? "" : String(v));
const list = (v) => (v && typeof v === "object" ? Object.values(v) : []);

// ------------------------------------------------------------ main

const db = await mysql.createConnection({
  host: process.env.DB_HOST ?? "172.21.0.2",
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASS,
  database: process.env.DB_NAME ?? "oez_praxis",
  charset: "utf8mb4",
});
const q = async (sql) => (await db.query(sql))[0];

const pages = await q("SELECT * FROM tl_page ORDER BY pid, sorting");
const articles = await q("SELECT * FROM tl_article ORDER BY pid, sorting");
const contents = await q("SELECT * FROM tl_content WHERE ptable IN ('', 'tl_article') ORDER BY pid, sorting");
const files = await q("SELECT * FROM tl_files");
const modules = await q("SELECT * FROM tl_module");
const forms = await q("SELECT * FROM tl_form");
const formFields = await q("SELECT * FROM tl_form_field ORDER BY pid, sorting");
await db.end();

// ------------------------------------------------------------ files

const fileByUuid = new Map();
for (const f of files) {
  if (!f.uuid) continue;
  const meta = unserialize(f.meta);
  const de = meta?.de ?? {};
  fileByUuid.set(Buffer.from(f.uuid).toString("hex"), {
    path: f.path,
    type: f.type,
    alt: str(de.alt),
    title: str(de.title),
    caption: str(de.caption),
  });
}
const usedFiles = new Set();
const fileRef = (uuidBuf) => {
  if (!uuidBuf || !uuidBuf.length) return null;
  const f = fileByUuid.get(Buffer.from(uuidBuf).toString("hex"));
  if (!f) return null;
  usedFiles.add(f.path);
  return f;
};
const filesInFolder = (folder) =>
  [...fileByUuid.values()]
    .filter((f) => f.type === "file" && f.path.startsWith(folder.path + "/"))
    .sort((a, b) => a.path.localeCompare(b.path));

// ------------------------------------------------------------ pages / links

const pageById = new Map(pages.map((p) => [p.id, p]));
const pageUrl = (id) => {
  const p = pageById.get(Number(id));
  if (!p) return "#";
  if (p.type === "root") return "/";
  if (p.alias === "startseite") return "/";
  return "/" + p.alias;
};

function fixHtml(html) {
  if (!html) return "";
  let h = str(html);
  h = h.replace(/\{\{link_url::(\d+)\}\}/g, (_, id) => pageUrl(id));
  h = h.replace(/\{\{link_open::(\d+)\}\}/g, (_, id) => `<a href="${pageUrl(id)}">`);
  h = h.replace(/\{\{link_close\}\}/g, "</a>");
  h = h.replace(/\{\{link::(\d+)\}\}/g, (_, id) => {
    const p = pageById.get(Number(id));
    return `<a href="${pageUrl(id)}">${p ? str(p.title) : ""}</a>`;
  });
  h = h.replace(/\{\{file::([0-9a-f-]+)\}\}/gi, (_, u) => {
    const f = fileByUuid.get(u.replace(/-/g, "").toLowerCase());
    if (f) usedFiles.add(f.path);
    return f ? "/" + f.path : "#";
  });
  h = h.replace(/\{\{insert_module::\d+\}\}/g, "");
  h = h.replace(/\{\{env::[^}]+\}\}/g, "");
  h = h
    .replace(/\[nbsp\]/g, "&nbsp;")
    .replace(/\[-\]/g, "&shy;")
    .replace(/\[&\]/g, "&amp;")
    .replace(/\[lt\]/g, "&lt;")
    .replace(/\[gt\]/g, "&gt;");
  // relative Contao linkleri (base href = site koku)
  h = h.replace(/(href|src)="(?!https?:|mailto:|tel:|#|\/|data:)([^"]+)"/g, (_, a, u) => {
    if (u.startsWith("files/")) {
      usedFiles.add(decodeURIComponent(u.split("?")[0]));
      return `${a}="/${u}"`;
    }
    const m = u.match(/^([^?#]+?)\.html(.*)$/);
    if (m) return `${a}="${m[1] === "startseite" ? "/" : "/" + m[1]}${m[2]}"`;
    return `${a}="/${u}"`;
  });
  h = h.replace(/(href)="https?:\/\/(?:www\.)?oezdemir-die-praxis\.de\/?([^"]*)"/g, (_, a, u) =>
    `${a}="/${u.replace(/\.html$/, "")}"`,
  );
  return h.trim();
}

function headline(c) {
  const h = unserialize(c.headline);
  if (!h) return null;
  const text = str(h.value).trim();
  return text ? { tag: str(h.unit) || "h2", text } : null;
}

function imageOf(c, uuidField = "singleSRC") {
  const f = fileRef(c[uuidField]);
  if (!f) return null;
  const size = list(unserialize(c.size)).map(str);
  return {
    src: "/" + f.path,
    alt: str(c.alt) || f.alt,
    title: str(c.title) || f.title,
    caption: str(c.caption) || f.caption,
    href: c.imageUrl ? fixHtml(`href="${str(c.imageUrl)}"`).slice(6, -1) : "",
    fullsize: !!Number(c.fullsize),
    floating: str(c.floating) || "above",
    size: size.some(Boolean) ? size : undefined,
  };
}

// ------------------------------------------------------------ content elements

function element(c) {
  const base = {
    id: c.id,
    hidden: c.invisible === "1" || c.invisible === 1 ? true : undefined,
    cssClass: list(unserialize(c.cssID)).map(str)[1] || undefined,
    headline: headline(c) ?? undefined,
  };
  switch (c.type) {
    case "text":
      return { ...base, type: "text", html: fixHtml(c.text), image: c.addImage === "1" ? imageOf(c) : undefined };
    case "headline":
      return { ...base, type: "headline" };
    case "html":
      return { ...base, type: "html", html: fixHtml(c.html) };
    case "image":
      return { ...base, type: "image", image: imageOf(c) };
    case "gallery": {
      const order = list(unserialize(c.orderSRC));
      let imgs = [];
      for (const u of list(unserialize(c.multiSRC))) {
        const f = fileRef(u);
        if (!f) continue;
        if (f.type === "folder") imgs.push(...filesInFolder(f));
        else imgs.push(f);
      }
      if (order.length && c.sortBy === "custom") {
        const pos = new Map(order.map((u, k) => [fileRef(u)?.path, k]));
        imgs.sort((a, b) => (pos.get(a.path) ?? 999) - (pos.get(b.path) ?? 999));
      }
      imgs.forEach((f) => usedFiles.add(f.path));
      return {
        ...base,
        type: "gallery",
        perRow: Number(c.perRow) || 4,
        fullsize: !!Number(c.fullsize),
        images: imgs.map((f) => ({ src: "/" + f.path, alt: f.alt, title: f.title, caption: f.caption })),
      };
    }
    case "download": {
      const f = fileRef(c.singleSRC);
      return { ...base, type: "download", src: f ? "/" + f.path : "", title: str(c.linkTitle) || (f ? path.basename(f.path) : "") };
    }
    case "form": {
      const form = forms.find((x) => x.id === Number(c.form));
      return {
        ...base,
        type: "form",
        form: form && {
          id: form.id,
          title: str(form.title),
          recipient: str(form.recipient),
          fields: formFields
            .filter((ff) => ff.pid === form.id)
            .map((ff) => ({ type: str(ff.type), name: str(ff.name), label: str(ff.label), mandatory: ff.mandatory === "1" })),
        },
      };
    }
    default:
      return { ...base, type: c.type, raw: true };
  }
}

/** rs_columns_* / slider* start-stop ciftlerini ic ice yapiya cevirir. */
function nest(cs) {
  const root = { elements: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  // columns icinde kolonsuz gelen eleman -> implicit kolon ac
  const holder = () => {
    if (top().type === "columns") {
      const col = { elements: [], implicit: true };
      top().columns.push(col);
      stack.push(col);
    }
    return top();
  };
  for (const c of cs) {
    const hidden = c.invisible === "1" || c.invisible === 1 ? true : undefined;
    const cols = (k) => str(c[k]) || undefined;
    switch (c.type) {
      case "rs_columns_start": {
        const el = {
          id: c.id, type: "columns", hidden,
          cssClass: list(unserialize(c.cssID)).map(str)[1] || undefined,
          large: cols("rs_columns_large"), medium: cols("rs_columns_medium"), small: cols("rs_columns_small"),
          columns: [],
        };
        holder().elements.push(el);
        // rs_columns_start: alt elemanlar dogrudan da gelebilir (kolon sarmalayicisiz)
        const col = { elements: [], implicit: true };
        el.columns.push(col);
        stack.push(el, col);
        break;
      }
      case "rs_column_start": {
        // implicit kolon bossa at, gercek kolona gec
        const cur = top();
        if (cur.implicit) {
          stack.pop();
          const parent = top();
          if (!cur.elements.length) parent.columns.pop();
        }
        const col = {
          elements: [], hidden,
          large: cols("rs_columns_large"), medium: cols("rs_columns_medium"), small: cols("rs_columns_small"),
        };
        top().columns.push(col);
        stack.push(col);
        break;
      }
      case "rs_column_stop":
        if (stack.length > 1 && !top().implicit) stack.pop();
        break;
      case "rs_columns_stop":
        while (stack.length > 1 && top().type !== "columns") stack.pop();
        if (stack.length > 1) stack.pop();
        break;
      case "sliderStart": {
        const el = { id: c.id, type: "slider", hidden, delay: Number(c.sliderDelay) || 0, elements: [] };
        holder().elements.push(el);
        stack.push(el);
        break;
      }
      case "sliderStop":
        while (stack.length > 1 && top().type !== "slider") stack.pop();
        if (stack.length > 1) stack.pop();
        break;
      default:
        holder().elements.push(element(c));
    }
  }
  return root.elements;
}

// ------------------------------------------------------------ site

const site = {
  exportedAt: new Date().toISOString(),
  source: process.env.DB_NAME ?? "oez_praxis",
  modules: Object.fromEntries(
    modules.filter((m) => m.type === "html").map((m) => [m.id, { name: str(m.name), html: fixHtml(m.html) }]),
  ),
  pages: pages
    .filter((p) => p.type !== "root")
    .map((p) => ({
      id: p.id,
      pid: p.pid,
      type: str(p.type),
      alias: str(p.alias),
      url: pageUrl(p.id),
      title: str(p.title),
      pageTitle: str(p.pageTitle) || undefined,
      description: str(p.description) || undefined,
      published: p.published === "1",
      hide: p.hide === "1",
      jumpTo: p.jumpTo || undefined,
      sorting: p.sorting,
      articles: articles
        .filter((a) => a.pid === p.id)
        .map((a) => ({
          id: a.id,
          title: str(a.title),
          column: str(a.inColumn),
          published: a.published === "1",
          cssClass: list(unserialize(a.cssID)).map(str)[1] || undefined,
          elements: nest(contents.filter((c) => c.pid === a.id)),
        })),
    })),
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(site, null, 2));

// ------------------------------------------------------------ copy files

// kullanilan + files/ altindaki tum medya (yedekler haric)
for (const f of fileByUuid.values()) if (f.type === "file") usedFiles.add(f.path);
let copied = 0;
const missing = [];
for (const rel of [...usedFiles].sort()) {
  if (SKIP_FILES.some((r) => r.test(rel))) continue;
  const src = path.join(FILES_ROOT, rel);
  const dst = path.join(OUT_FILES, rel);
  if (!fs.existsSync(src)) {
    missing.push(rel);
    continue;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  copied++;
}

console.log(`site.json: ${site.pages.length} sayfa, ${contents.length} icerik elemani`);
console.log(`files: ${copied} kopyalandi -> public/files`);
if (missing.length) console.log(`eksik dosya (${missing.length}):\n  ` + missing.join("\n  "));
