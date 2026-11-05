export function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function summarizeSessions(sessions, now = new Date()) {
  const today = dateKey(now);
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysSinceMonday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  const firstDayOfWeek = dateKey(weekStart);
  const subjects = new Set();
  let weekMinutes = 0;

  for (const session of sessions) {
    if (typeof session.subject === "string" && session.subject.trim()) {
      subjects.add(session.subject.trim().toLowerCase());
    }

    if (
      Number.isFinite(session.duration) &&
      session.date >= firstDayOfWeek &&
      session.date <= today
    ) {
      weekMinutes += session.duration;
    }
  }

  return {
    weekMinutes,
    sessionCount: sessions.length,
    subjectCount: subjects.size,
  };
}

export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} hr${hours === 1 ? "" : "s"}`;
  return `${hours} hr${hours === 1 ? "" : "s"} ${remainingMinutes} min`;
}
