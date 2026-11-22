/**
 * Longest gap counted between two actions: beyond that the player probably
 * put the phone down, so a pause doesn't inflate the answering time.
 */
export const MAX_GAP_MS = 2 * 60 * 1000;

/** Active time to add for an action happening at `now`, given the previous one. */
export function activeGap(lastActivity: number | null, now: number): number {
  if (lastActivity == null) return 0;
  return Math.max(0, Math.min(now - lastActivity, MAX_GAP_MS));
}

/** Human-readable French duration ("moins d'une minute", "12 min", "1 h 05"). */
export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "moins d'une minute";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} h ${String(rest).padStart(2, "0")}`;
}
