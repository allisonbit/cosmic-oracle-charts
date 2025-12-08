import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { CryptoTicker } from "./CryptoTicker";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showTicker?: boolean;
}

export function Layout({ children, showTicker = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col cosmic-bg">
      <Navbar />
      {showTicker && (
        <div className="mt-16">
          <CryptoTicker />
        </div>
      )}
      <main className={showTicker ? "" : "mt-16"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
