import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lotto Lab — 로또 시뮬레이터",
  description: "매주 로또를 구매한다면, 1등까지 얼마나 걸릴까요? 직접 시뮬레이션해 보세요.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
