export default function AppLoading() {
  return (
    <div className="p-8 max-w-4xl animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 bg-bg-elevated rounded-xl w-32" />
          <div className="h-4 bg-bg-elevated rounded-lg w-24" />
        </div>
        <div className="h-10 bg-bg-elevated rounded-xl w-32" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 bg-bg-elevated rounded-2xl border border-border-subtle" />
        ))}
      </div>
    </div>
  );
}
