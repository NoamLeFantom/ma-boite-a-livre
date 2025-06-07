/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "books.google.com",
      // ajoute d'autres domaines si besoin
    ],
  },
};

export default nextConfig;
