module.exports = {
  experimental: {
    forceSwcTransforms: true, // Fixes error when using babel register with nextjs
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8080/api/v1/:path*", // Proxy to Backend
      },
    ];
  },
};
