import { Anton } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "../lib/cart-context";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import MobileTabBar from "../components/MobileTabBar";

// Runs before hydration so the page never flashes the wrong theme on load.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("shaviyani-theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`;

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata = {
  title: "Shaviyani Pro — Team Jerseys",
  description: "Sports jerseys, corporate uniforms and custom team kits from Shaviyani Pro, Male', Maldives.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={anton.variable}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body>
        <CartProvider>
          <Nav />
          {children}
          <Footer />
          <MobileTabBar />
        </CartProvider>
      </body>
    </html>
  );
}
