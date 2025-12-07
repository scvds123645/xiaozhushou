import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "随机身份生成器 - 专业测试工具",
  description: "快速生成逼真的随机身份信息，支持100+国家，包含姓名、生日、手机号、邮箱等完整数据，专为开发测试设计",
  keywords: "随机身份生成器,假身份,测试数据,临时邮箱,开发工具",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "随机身份生成器"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}