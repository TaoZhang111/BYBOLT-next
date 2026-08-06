import type { Metadata } from "next";

import { AdminApp } from "@/components/admin/admin-app";

export const metadata: Metadata = {
  title: "Catalog Admin | BYBOLT",
  description: "Private BYBOLT product and material catalog administration.",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminPage() {
  return <AdminApp />;
}
