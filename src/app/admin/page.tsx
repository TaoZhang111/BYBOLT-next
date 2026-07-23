import type { Metadata } from "next";

import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = {
  title: "Product Admin | BYBOLT",
  description: "Private BYBOLT product catalog administration.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminApp />;
}
