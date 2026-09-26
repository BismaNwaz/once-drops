import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-40 text-center">
      <p className="label text-muted">404</p>
      <h1 className="mt-4 font-serif text-7xl">Not in the archive.</h1>
      <p className="mt-4 text-muted">This page doesn&apos;t exist — or never did.</p>
      <Link href="/" className="btn btn-ink mt-10">Back to the drops</Link>
    </div>
  );
}
