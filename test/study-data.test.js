import test from "node:test";
import assert from "node:assert/strict";
import { formatDuration, summarizeSessions } from "../src/study-data.js";

test("summarizes sessions from Monday through the current day", () => {
  const sessions = [
    { subject: "Biology", duration: 45, date: "2026-11-02" },
    { subject: "biology", duration: 30, date: "2026-11-05" },
    { subject: "History", duration: 60, date: "2026-11-01" },
    { subject: "Future topic", duration: 90, date: "2026-11-06" },
  ];

  assert.deepEqual(
    summarizeSessions(sessions, new Date(2026, 10, 5)),
    { weekMinutes: 75, sessionCount: 4, subjectCount: 3 },
  );
});

test("formats minutes into readable hours and minutes", () => {
  assert.equal(formatDuration(0), "0 min");
  assert.equal(formatDuration(45), "45 min");
  assert.equal(formatDuration(60), "1 hr");
  assert.equal(formatDuration(90), "1 hr 30 min");
  assert.equal(formatDuration(120), "2 hrs");
});
