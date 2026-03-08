import { ReactNode } from "react";
import { SignalsNavbar } from "./SignalsNavbar";
import { SignalsFooter } from "./SignalsFooter";
import { AnnouncementBar } from "./AnnouncementBar";
import { ScrollToTop } from "./ScrollToTop";
import { LiveChatButton } from "./LiveChatButton";
import { CookieConsent } from "./CookieConsent";
import { EmailPopup } from "./EmailPopup";

interface SignalsLayoutProps {
  children: ReactNode;
}

export function SignalsLayout({ children }: SignalsLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AnnouncementBar />
      <SignalsNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <SignalsFooter />
      <ScrollToTop />
      <LiveChatButton />
      <CookieConsent />
      <EmailPopup />
    </div>
  );
}
