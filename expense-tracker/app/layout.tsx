// import type { Metadata } from "next";
// import { Geist } from "next/font/google";

// import "./globals.css";
// import ThemeProvider from "@/src/components/ThemeProvider";

// const geist = Geist({
//     variable: "--font-geist",
//     subsets: ["latin"],
// });

// export const metadata: Metadata = {
//     title: "Pocket Tracker",
//     description:
//         "Track your income, expenses, savings, and spending habits with Pocket Tracker.",
// };

// export default function RootLayout({
//     children,
// }: Readonly<{
//     children: React.ReactNode;
// }>) {
//     return (
//         <html
//             lang="en"
//             className={`${geist.variable} h-full antialiased`}
//         >
//             <body className="min-h-full bg-[#F8F7F2]">
//                 {children}
//             </body>
//         </html>
//     );
// }



import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/src/components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pocket Tracker",
  description: "Track your income, expenses, and savings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
