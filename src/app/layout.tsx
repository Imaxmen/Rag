import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const text = Onest({
  variable: "--font-text",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Пиксель — цифровые курсы",
  description:
    "Онлайн-курсы по дизайну, разработке, маркетингу и нейросетям. Практика на реальных проектах и преподаватели из индустрии.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={text.variable}>
      <body>{children}</body>
    </html>
  );
}
