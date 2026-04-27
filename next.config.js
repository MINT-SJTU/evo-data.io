/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    // 环境变量：NEXT_PUBLIC_API_URL 指向后端 API 地址
    // 例如：NEXT_PUBLIC_API_URL=https://api.evo-data.io
    // 在 GitHub Pages 部署时，在仓库 Settings → Secrets → Actions 中配置
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    },
};

module.exports = nextConfig;
