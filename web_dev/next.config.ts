import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // statischer Export: out/team.html, out/leistungen/bleaching.html ...
  // -> gleiche URLs wie die alte Contao-Seite
  output: "export",
  // GitHub-Pages-Demo: BASE_PATH=/alioezdemir/web_dev (siehe ../scripts/pages-rewrite.mjs)
  basePath: process.env.BASE_PATH ?? "",
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
