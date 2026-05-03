import { Nav } from "@/components/Nav";

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-10">{children}</main>
    </>
  );
}
