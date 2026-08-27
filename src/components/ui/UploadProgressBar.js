export function UploadProgressBar({ value, status = "uploading" }) {
  const fillColor = status === "error" ? "[&::-webkit-progress-value]:bg-error [&::-moz-progress-bar]:bg-error" : status === "success" ? "[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success" : "[&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent";

  return (
    <div className="flex flex-col gap-1">
      <progress
        value={value}
        max={100}
        className={`w-full h-2 border border-border bg-surface [&::-webkit-progress-bar]:bg-surface [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-150 [&::-webkit-progress-value]:ease-linear ${fillColor}`}
      />
      <span className="font-mono text-xs text-muted">{value}%</span>
    </div>
  );
}
