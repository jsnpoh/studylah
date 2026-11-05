import { dateKey, formatDuration, summarizeSessions } from "./study-data.js";

const storageKey = "studylah.sessions";
const form = document.querySelector("#session-form");
const subjectInput = document.querySelector("#subject");
const durationInput = document.querySelector("#duration");
const dateInput = document.querySelector("#session-date");
const notesInput = document.querySelector("#notes");
const message = document.querySelector("#form-message");
const sessionList = document.querySelector("#session-list");
const today = dateKey(new Date());
dateInput.value = today;
dateInput.max = today;
document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(
  undefined,
  { weekday: "long", month: "long", day: "numeric" },
).format(new Date());

let sessions = loadSessions();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const subject = subjectInput.value.trim();
  const duration = Number(durationInput.value);
  const sessionDate = dateInput.value;

  if (!subject || !Number.isInteger(duration) || duration < 1 || duration > 1440) {
    showMessage("Add a subject and a duration between 1 and 1,440 minutes.", true);
    return;
  }

  if (!sessionDate || sessionDate > today) {
    showMessage("Choose today or an earlier date for your session.", true);
    return;
  }

  sessions.push({
    id: createId(),
    subject,
    duration,
    date: sessionDate,
    notes: notesInput.value.trim(),
    createdAt: Date.now(),
  });

  if (!saveSessions()) {
    sessions.pop();
    showMessage("Couldn't save your session in this browser.", true);
    return;
  }

  form.reset();
  dateInput.value = today;
  showMessage("Session saved. Nice work!");
  render();
  subjectInput.focus();
});

function loadSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter(
      (session) =>
        session &&
        typeof session.id === "string" &&
        typeof session.subject === "string" &&
        Number.isInteger(session.duration) &&
        session.duration > 0 &&
        typeof session.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(session.date) &&
        typeof session.notes === "string",
    );
  } catch {
    return [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(sessions));
    return true;
  } catch {
    return false;
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function render() {
  const summary = summarizeSessions(sessions, new Date());
  document.querySelector("#week-time").textContent = formatDuration(summary.weekMinutes);
  document.querySelector("#session-count").textContent = String(summary.sessionCount);
  document.querySelector("#subject-count").textContent = String(summary.subjectCount);
  document.querySelector("#history-total").textContent =
    `${summary.sessionCount} ${summary.sessionCount === 1 ? "session" : "sessions"}`;
  sessionList.replaceChildren();

  if (!sessions.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    const illustration = document.createElement("span");
    illustration.className = "empty-illustration";
    illustration.setAttribute("aria-hidden", "true");
    illustration.textContent = "✧";
    const title = document.createElement("h3");
    title.textContent = "Your story starts here";
    const description = document.createElement("p");
    description.textContent = "Log your first session and celebrate showing up for yourself.";
    emptyState.append(illustration, title, description);
    sessionList.append(emptyState);
    return;
  }

  const sortedSessions = [...sessions].sort(
    (first, second) =>
      second.date.localeCompare(first.date) || second.createdAt - first.createdAt,
  );
  for (const session of sortedSessions) {
    sessionList.append(createSessionElement(session));
  }
}

function createSessionElement(session) {
  const item = document.createElement("article");
  item.className = "session-item";

  const icon = document.createElement("span");
  icon.className = "session-dot";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✦";

  const main = document.createElement("div");
  main.className = "session-main";

  const titleRow = document.createElement("div");
  titleRow.className = "session-title-row";
  const subject = document.createElement("h3");
  subject.className = "session-subject";
  subject.textContent = session.subject;
  const duration = document.createElement("span");
  duration.className = "session-duration";
  duration.textContent = formatDuration(session.duration);
  titleRow.append(subject, duration);

  const meta = document.createElement("p");
  meta.className = "session-meta";
  meta.textContent = formatDate(session.date);
  main.append(titleRow, meta);

  if (session.notes) {
    const notes = document.createElement("p");
    notes.className = "session-notes";
    notes.textContent = session.notes;
    main.append(notes);
  }

  const remove = document.createElement("button");
  remove.className = "delete-button";
  remove.type = "button";
  remove.textContent = "Delete";
  remove.setAttribute("aria-label", `Delete ${session.subject} session`);
  remove.addEventListener("click", () => {
    const previousSessions = sessions;
    sessions = sessions.filter((entry) => entry.id !== session.id);
    if (!saveSessions()) {
      sessions = previousSessions;
      showMessage("Couldn't update your study log in this browser.", true);
      return;
    }
    showMessage("Session deleted.");
    render();
  });

  item.append(icon, main, remove);
  return item;
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
