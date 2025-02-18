module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/v1/:path*", // Proxy to Backend
      },
    ];
  },
};
