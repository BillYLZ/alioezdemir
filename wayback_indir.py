#!/usr/bin/env python3
"""
oezdemir-die-praxis.de sitesini Wayback Machine'den 2016-2022 arasi
TAM olarak indirir: tum sayfalar, alt menuler, yazilar, resimler, PDF/dokumanlar.

Nasil calisir:
  1. CDX API'den domain'in (www dahil) tum arsiv kayitlari alinir.
  2. Her yil icin o yilin sonuna kadarki en son kayitlar baslangic olur.
  3. Inen her HTML/CSS taranir (href, src, srcset, url(), ?file=...);
     siteye ait her link de indirilir (crawler). Arsivde o yila ait kayit
     yoksa en yakin tarihli kayit kullanilir; CDX'te hic yoksa Wayback'e
     dogrudan sorulur.
  4. Linkler yerel calisacak sekilde duzeltilir.

Cikti: data/site_{YIL}/  (her yil ayri, tam kopya)

Kullanim:
    python3 wayback_indir.py              # 2016..2022 hepsi
    python3 wayback_indir.py --yil 2018   # sadece bir yil
    python3 wayback_indir.py --liste      # sadece CDX listesini yaz
    python3 wayback_indir.py --yenile     # CDX listesini tekrar cek

Yarida kesilirse tekrar calistir: inmis dosyalar data/_cache'ten gelir.
"""
import argparse
import hashlib
import html
import json
import os
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DOMAIN = "oezdemir-die-praxis.de"
YIL_BAS, YIL_SON = 2016, 2022
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
CACHE_DIR = os.path.join(DATA_DIR, "_cache")
CDX_FILE = os.path.join(DATA_DIR, "cdx_all.json")
BEKLEME = 4.5       # istekler arasi saniye; archive.org ~15 istek/dk ustunde IP'yi bloklar
MAX_DOSYA = 3000    # yil basina guvenlik siniri (sonsuz sayfalama vs.)

UA = "Mozilla/5.0 (X11; Linux x86_64) wayback-restore/1.0"
ATLA_SEMA = ("mailto:", "tel:", "javascript:", "data:", "#", "about:")


# ---------------------------------------------------------------- HTTP

def http_get(url, deneme=8):
    """(veri, content_type) ya da (None, None)."""
    for i in range(deneme):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read(), r.headers.get("Content-Type", "")
        except urllib.error.HTTPError as e:
            if e.code in (403, 404, 410):
                return None, None
            bekle = 120 if e.code == 429 else 10 * (i + 1)
            print(f"   HTTP {e.code}, {bekle}s bekleniyor ({i + 1}/{deneme})")
            time.sleep(bekle)
        except Exception as e:  # timeout, baglanti kopmasi
            # "Connection refused" = archive.org IP'yi gecici blokladi (~5 dk)
            bekle = 300 if "refused" in str(e) else 10 * (i + 1)
            print(f"   hata: {e}, {bekle}s bekleniyor ({i + 1}/{deneme})")
            time.sleep(bekle)
    return None, None


def cache_oku(anahtar):
    yol = os.path.join(CACHE_DIR, anahtar)
    if not os.path.exists(yol):
        return None, None
    mime = ""
    if os.path.exists(yol + ".mime"):
        with open(yol + ".mime") as f:
            mime = f.read().strip()
    with open(yol, "rb") as f:
        return f.read(), mime


def cache_yaz(anahtar, veri, mime):
    os.makedirs(CACHE_DIR, exist_ok=True)
    yol = os.path.join(CACHE_DIR, anahtar)
    with open(yol + ".tmp", "wb") as f:
        f.write(veri)
    os.replace(yol + ".tmp", yol)
    with open(yol + ".mime", "w") as f:
        f.write(mime or "")


def wayback_cek(cache_key, wb_url, mime_tahmin=""):
    veri, mime = cache_oku(cache_key)
    if veri is not None:
        return veri, mime or mime_tahmin
    veri, ct = http_get(wb_url)
    time.sleep(BEKLEME)
    if veri is None:
        return None, None
    mime = mime_tahmin or (ct or "").split(";")[0].strip()
    cache_yaz(cache_key, veri, mime)
    return veri, mime


# ---------------------------------------------------------------- CDX

def cdx_listesi(yenile=False):
    if os.path.exists(CDX_FILE) and not yenile:
        with open(CDX_FILE) as f:
            return json.load(f)
    params = urllib.parse.urlencode({
        "url": DOMAIN,
        "matchType": "domain",  # www.* dahil
        "output": "json",
        "fl": "timestamp,original,statuscode,mimetype,digest",
        "filter": "statuscode:200",
    })
    print("CDX listesi aliniyor...")
    raw, _ = http_get(f"https://web.archive.org/cdx/search/cdx?{params}")
    if not raw:
        sys.exit("CDX alinamadi (arsiv gecici kapali olabilir, sonra tekrar dene).")
    rows = json.loads(raw)
    kayitlar = [dict(zip(rows[0], r)) for r in rows[1:]] if rows else []
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(CDX_FILE, "w") as f:
        json.dump(kayitlar, f, indent=1)
    return kayitlar


def url_anahtar(url):
    """www., :80, http/https farklarini birlestirir -> (path, query)."""
    p = urllib.parse.urlsplit(url)
    path = urllib.parse.unquote(p.path) or "/"
    path = re.sub(r"/{2,}", "/", path)
    return path, p.query


def site_url_mi(url):
    host = (urllib.parse.urlsplit(url).hostname or "").lower()
    return host == DOMAIN or host.endswith("." + DOMAIN)


def kayit_sec(kayitlar, sinir):
    """sinir'a kadarki en son kayit; yoksa sinir'dan sonraki en erken."""
    once = [k for k in kayitlar if k["timestamp"] <= sinir]
    if once:
        return max(once, key=lambda k: k["timestamp"])
    return min(kayitlar, key=lambda k: k["timestamp"]) if kayitlar else None


# ---------------------------------------------------------------- yerel yol

def file_param(query):
    """Contao indirme linki: sayfa.html?file=files/x.pdf -> files/x.pdf"""
    q = urllib.parse.parse_qs(query)
    return q["file"][0] if q.get("file") else None


def html_mi(mime):
    return mime.startswith("text/html") or mime == "application/xhtml+xml"


def yerel_yol(path, query, mime=""):
    f = file_param(query)
    if f:
        path, query = "/" + f, ""
    if path.endswith("/"):
        path += "index.html"
    elif html_mi(mime) and not os.path.splitext(path)[1]:
        # uzantisiz sayfa (ornek /datenschutz) -> datenschutz/index.html
        path += "/index.html"
    if query:
        kok, ext = os.path.splitext(path)
        guvenli = re.sub(r"[^A-Za-z0-9=._-]", "_", query)
        path = f"{kok}__{guvenli}{ext}"
    parcalar = [p for p in path.split("/") if p not in ("", ".", "..")]
    return "/".join(parcalar) if parcalar else "index.html"


# ---------------------------------------------------------------- link tarama

ATTR_RE = re.compile(
    r"""(\b(?:href|src|data-src|data-href|poster|action|data-lightbox)\s*=\s*)(["'])(.*?)\2""",
    re.I | re.S,
)
SRCSET_RE = re.compile(r"""(\bsrcset\s*=\s*)(["'])(.*?)\2""", re.I | re.S)
CSSURL_RE = re.compile(r"""url\(\s*(["']?)([^"')]+)\1\s*\)""", re.I)
IMPORT_RE = re.compile(r"""@import\s+(["'])([^"']+)\1""", re.I)
BASE_RE = re.compile(r"""<base\s+href\s*=\s*["']([^"']*)["']""", re.I)
WAYBACK_RE = re.compile(
    r"(?:https?:)?//web\.archive\.org/web/\d+(?:[a-z]{2}_)?/", re.I
)


def metne(veri):
    try:
        return veri.decode("utf-8"), "utf-8"
    except UnicodeDecodeError:
        return veri.decode("latin-1"), "latin-1"


def metin_mi(mime):
    return html_mi(mime) or mime == "text/css" or "javascript" in mime


def taban_url(sayfa_path, metin, mime):
    if html_mi(mime):
        m = BASE_RE.search(metin)
        if m:
            b = WAYBACK_RE.sub("", m.group(1))
            return urllib.parse.urljoin(f"http://{DOMAIN}/", b)
    return f"http://{DOMAIN}{sayfa_path}"


def mutlak(ref, taban):
    ref = html.unescape(ref.strip())
    ref = WAYBACK_RE.sub("", ref)
    if not ref or ref.lower().startswith(ATLA_SEMA) or "{{" in ref:
        return None
    url = urllib.parse.urljoin(taban, ref)
    url = urllib.parse.urldefrag(url)[0]
    return url if site_url_mi(url) else None


def referanslar(veri, mime, sayfa_path):
    if not (html_mi(mime) or mime == "text/css"):
        return []
    metin, _ = metne(veri)
    taban = taban_url(sayfa_path, metin, mime)
    adaylar = []
    if html_mi(mime):
        adaylar += [m.group(3) for m in ATTR_RE.finditer(metin)]
        for m in SRCSET_RE.finditer(metin):
            adaylar += [p.strip().split(" ")[0] for p in m.group(3).split(",")]
    adaylar += [m.group(2) for m in CSSURL_RE.finditer(metin)]
    adaylar += [m.group(2) for m in IMPORT_RE.finditer(metin)]
    sonuc = []
    for r in adaylar:
        u = mutlak(r, taban)
        if u:
            sonuc.append(url_anahtar(u))
    return sonuc


# ---------------------------------------------------------------- link duzeltme

DOMAIN_RE = re.compile(
    r"(?:https?:)?//(?:www\.)?" + re.escape(DOMAIN) + r"(?::80)?/?", re.I
)


def linkleri_duzelt(veri, mime, sayfa_path, mime_haritasi):
    if not metin_mi(mime):
        return veri
    metin, enc = metne(veri)
    metin = WAYBACK_RE.sub("", metin)

    if html_mi(mime):
        taban = taban_url(sayfa_path, metin, mime)

        def attr(m):
            u = mutlak(m.group(3), taban)
            if not u:
                return m.group(0)
            path, query = url_anahtar(u)
            if not query and not file_param(query):
                return m.group(0)
            # ?file=... ve query'li linkler kaydedilen dosya adina gider
            yeni = "/" + yerel_yol(path, query, mime_haritasi.get((path, query), ""))
            return f"{m.group(1)}{m.group(2)}{html.escape(yeni)}{m.group(2)}"

        metin = ATTR_RE.sub(attr, metin)
        # Contao <base href="http://oezdemir-die-praxis.de/"> -> site koku
        metin = re.sub(r'(<base\s+href=")[^"]*(")', r"\1/\2", metin, flags=re.I)

    metin = DOMAIN_RE.sub("/", metin)
    return metin.encode(enc)


# ---------------------------------------------------------------- yil

def yil_olustur(yil, indeks):
    sinir = f"{yil}1231235959"
    hedef_dir = os.path.join(DATA_DIR, f"site_{yil}")
    if os.path.isdir(hedef_dir):
        shutil.rmtree(hedef_dir)  # eski ciktiyi temizle, bastan uret

    # baslangic: o yila kadar arsivlenmis her sey + ana sayfa
    kuyruk = [a for a, ks in indeks.items() if any(k["timestamp"] <= sinir for k in ks)]
    kuyruk += [("/", ""), ("/startseite.html", "")]
    gorulen, yazilan, mime_haritasi, eksik = set(), {}, {}, []
    icerikler = {}

    print(f"\n=== {yil} -> {hedef_dir}")
    while kuyruk and len(gorulen) < MAX_DOSYA:
        anahtar = kuyruk.pop(0)
        if anahtar in gorulen:
            continue
        gorulen.add(anahtar)
        path, query = anahtar
        orj = f"http://{DOMAIN}{urllib.parse.quote(path)}" + (f"?{query}" if query else "")

        k = kayit_sec(indeks.get(anahtar, []), sinir)
        if k:
            ts = k["timestamp"]
            veri, mime = wayback_cek(
                k["digest"],
                f"https://web.archive.org/web/{ts}id_/{k['original']}",
                k["mimetype"],
            )
        else:
            # CDX'te yok: Wayback en yakin kaydi bulsun
            ts = "~" + sinir[:8]
            key = "direct_" + hashlib.sha1(f"{yil}|{orj}".encode()).hexdigest()
            veri, mime = wayback_cek(key, f"https://web.archive.org/web/{sinir}id_/{orj}")

        rel = yerel_yol(path, query, mime or "")
        if veri is None:
            eksik.append(orj)
            print(f"   YOK  {orj}")
            continue
        mime_haritasi[anahtar] = mime
        if rel in yazilan:
            continue
        yazilan[rel] = anahtar
        icerikler[rel] = (veri, mime, path)
        print(f"[{len(yazilan)}] {ts} {rel}")

        for ref in referanslar(veri, mime, path):
            if ref not in gorulen:
                kuyruk.append(ref)

    # tum mime'lar bilindikten sonra yaz (query link duzeltmesi icin)
    for rel, (veri, mime, path) in icerikler.items():
        dosya = os.path.join(hedef_dir, rel)
        os.makedirs(os.path.dirname(dosya), exist_ok=True)
        with open(dosya, "wb") as f:
            f.write(linkleri_duzelt(veri, mime, path, mime_haritasi))

    # Contao ana sayfasi startseite.html; kok index.html yoksa kopyala
    idx = os.path.join(hedef_dir, "index.html")
    start = os.path.join(hedef_dir, "startseite.html")
    if not os.path.exists(idx) and os.path.exists(start):
        shutil.copyfile(start, idx)

    with open(os.path.join(hedef_dir, "_dosyalar.txt"), "w") as f:
        f.write("\n".join(sorted(yazilan)) + "\n")
    if eksik:
        with open(os.path.join(hedef_dir, "_eksik.txt"), "w") as f:
            f.write("\n".join(sorted(set(eksik))) + "\n")
    print(f"=== {yil}: {len(yazilan)} dosya, {len(eksik)} arsivde yok (_eksik.txt)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yil", type=int, help="sadece bu yil (2016-2022)")
    ap.add_argument("--liste", action="store_true", help="sadece CDX listesini yaz")
    ap.add_argument("--yenile", action="store_true", help="CDX listesini tekrar cek")
    a = ap.parse_args()

    kayitlar = cdx_listesi(a.yenile)
    indeks = {}
    for k in kayitlar:
        indeks.setdefault(url_anahtar(k["original"]), []).append(k)
    print(f"{len(kayitlar)} kayit, {len(indeks)} farkli URL")
    if a.liste:
        for k in sorted(kayitlar, key=lambda k: (k["original"], k["timestamp"])):
            print(k["timestamp"], k["mimetype"], k["original"])
        return

    yillar = [a.yil] if a.yil else range(YIL_BAS, YIL_SON + 1)
    for yil in yillar:
        yil_olustur(yil, indeks)
    print("\nBitti. Bakmak icin: cd data/site_YIL && python3 -m http.server 8000")


if __name__ == "__main__":
    main()
