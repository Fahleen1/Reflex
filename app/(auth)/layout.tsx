export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen font-[family-name:var(--font-marketing)] text-slate-900 antialiased">
      {children}
    </div>
  );
}
