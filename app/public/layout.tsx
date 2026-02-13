import { Suspense } from "react";

export const metadata = {
  title: "Mzigo Public Receipt",
  description: "View your parcel receipt",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center" />}>{children}</Suspense>;
}
