import "./globals.css";
import { ReduxProvider } from "./Provider";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import SessionProvider from "@/src/components/providers/SessionProvider";

export const metadata = {
  title: "Habit Routine - Smart Habit Tracker",
  description: "Track your daily habits with AI-powered insights and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <SessionProvider>
            <ReduxProvider>{children}</ReduxProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
