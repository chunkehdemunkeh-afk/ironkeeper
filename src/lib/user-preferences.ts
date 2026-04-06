import type { SplitDay } from "./training-splits";

export type UserPreferences = {
  onboardingComplete: boolean;
  daysPerWeek: number;
  splitId: string;
  splitName: string;
  schedule: SplitDay[];        // the ordered rotation of workouts
};

function getKey(userId: string) {
  return `ik-prefs-${userId}`;
}

export function getUserPreferences(userId: string): UserPreferences | null {
  try {
    const raw = localStorage.getItem(getKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserPreferences(userId: string, prefs: UserPreferences): void {
  try {
    localStorage.setItem(getKey(userId), JSON.stringify(prefs));
  } catch {
    console.warn("Failed to save user preferences");
  }
}

export function isOnboardingComplete(userId: string): boolean {
  return getUserPreferences(userId)?.onboardingComplete === true;
}

/**
 * Given the user's schedule and their workout history (most-recent first),
 * returns the next SplitDay they should do.
 */
export function getNextSplitDay(
  schedule: SplitDay[],
  recentWorkoutIds: string[]
): { next: SplitDay; nextIndex: number } {
  if (schedule.length === 0) return { next: schedule[0], nextIndex: 0 };

  // Walk backwards through history to find the most recent workout that
  // matches one of the schedule workoutIds
  for (const workoutId of recentWorkoutIds) {
    const doneIndex = schedule.findIndex((d) => d.workoutId === workoutId);
    if (doneIndex !== -1) {
      const nextIndex = (doneIndex + 1) % schedule.length;
      return { next: schedule[nextIndex], nextIndex };
    }
  }

  // Nothing in history matches — start from the beginning
  return { next: schedule[0], nextIndex: 0 };
}
