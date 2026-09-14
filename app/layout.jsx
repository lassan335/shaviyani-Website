import { Anton } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../lib/cart-context";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

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
      <body>
        <CartProvider>
          <Nav />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
