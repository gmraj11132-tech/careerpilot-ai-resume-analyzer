export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-md bg-card text-card-foreground border border-border rounded-xl shadow-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}
