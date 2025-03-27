export function darkenColor(color: string, percentage: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const r = (num >> 16) - (num >> 16) * (percentage / 100);
  const g = ((num >> 8) & 0x00ff) - ((num >> 8) & 0x00ff) * (percentage / 100);
  const b = (num & 0x0000ff) - (num & 0x0000ff) * (percentage / 100);
  return (
    "#" +
    [r, g, b]
      .map((channel) =>
        Math.max(0, Math.min(255, Math.round(channel)))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}
