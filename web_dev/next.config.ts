import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // statischer Export: out/team.html, out/leistungen/bleaching.html ...
  // -> gleiche URLs wie die alte Contao-Seite
  output: "export",
  trailingSlash: false,
  images: { unoptimized: true },
};

export default nextConfig;
