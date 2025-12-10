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
    <div className="min-h-screen flex flex-col cosmic-bg w-full overflow-x-hidden">
      <Navbar />
      {showTicker && (
        <div className="mt-14 md:mt-16">
          <CryptoTicker />
        </div>
      )}
      <main className={`flex-1 ${showTicker ? "" : "mt-14 md:mt-16"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
