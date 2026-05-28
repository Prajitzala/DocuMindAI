/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep pdf-parse on the Node runtime with a resolvable worker path.
  serverExternalPackages: ["pdf-parse", "canvas"],
};

export default nextConfig;
