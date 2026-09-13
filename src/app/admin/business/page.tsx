import type { Metadata } from "next";
import { BusinessAdminApp } from "@/components/admin/business-admin-app";

export const metadata: Metadata = { title: "Business OS | BYBOLT", description: "Private BYBOLT lead, quotation, contract, settlement and drawing administration.", robots: { index: false, follow: false, nocache: true } };

export default function BusinessAdminPage() { return <BusinessAdminApp />; }
