import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-24 text-center">
      <div>
        <p className="font-mono text-sm text-accent">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Page not found</h1>
        <p className="mt-4 text-muted">The requested page or language is not available.</p>
        <Link className="mt-8 inline-block border-b border-foreground" href="/en">
          Return home
        </Link>
      </div>
    </main>
  );
}
