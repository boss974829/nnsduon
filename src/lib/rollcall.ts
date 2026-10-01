export type Status = "present" | "late" | "absent" | "excused";

export type Student = {
  id: string;
  name: string;
  roll: string;
};

export type Classroom = {
  id: string;
  name: string;
  detail: string;
  students: Student[];
};

export type RollState = {
  classes: Classroom[];
  marks: Record<string, Status>;
  activeClassId: string;
};

export const STORAGE_KEY = "rollcall.v1";

export const STATUS_ORDER: Status[] = ["present", "late", "absent", "excused"];

export function markKey(classId: string, date: string, studentId: string) {
  return `${classId}|${date}|${studentId}`;
}

function student(classId: string, roll: string, name: string): Student {
  return { id: `${classId}-${roll}`, roll, name };
}

export function seedClasses(): Classroom[] {
  return [
    {
      id: "homeroom-8a",
      name: "Homeroom 8A",
      detail: "Homeroom · 8:10",
      students: [
        student("homeroom-8a", "01", "Amina Rahman"),
        student("homeroom-8a", "02", "Luis Ortega"),
        student("homeroom-8a", "03", "Priya Nair"),
        student("homeroom-8a", "04", "Jonah Ellis"),
        student("homeroom-8a", "05", "Mei Lin"),
        student("homeroom-8a", "06", "Omar Haddad"),
        student("homeroom-8a", "07", "Sofia Rossi"),
        student("homeroom-8a", "08", "Caleb Brooks"),
        student("homeroom-8a", "09", "Hana Suzuki"),
        student("homeroom-8a", "10", "Noah Williams"),
        student("homeroom-8a", "11", "Fatima Diallo"),
        student("homeroom-8a", "12", "Evan Cho"),
      ],
    },
    {
      id: "biology-10",
      name: "Biology 10",
      detail: "Period 3 · 10:40",
      students: [
        student("biology-10", "01", "Maya Chen"),
        student("biology-10", "02", "Andre Silva"),
        student("biology-10", "03", "Leila Hassan"),
        student("biology-10", "04", "Thomas Wright"),
        student("biology-10", "05", "Anika Bose"),
        student("biology-10", "06", "Peter Novak"),
        student("biology-10", "07", "Grace Okonkwo"),
        student("biology-10", "08", "Samir Patel"),
        student("biology-10", "09", "Elena Popov"),
        student("biology-10", "10", "Jack Murray"),
      ],
    },
    {
      id: "art-club",
      name: "Art club",
      detail: "Thursday · 3:30",
      students: [
        student("art-club", "01", "Iris Berg"),
        student("art-club", "02", "Diego Alvarez"),
        student("art-club", "03", "Chloe Martin"),
        student("art-club", "04", "Kenji Sato"),
        student("art-club", "05", "Amara Cole"),
        student("art-club", "06", "Felix Nguyen"),
        student("art-club", "07", "Nora Ibrahim"),
        student("art-club", "08", "Quinn Harper"),
      ],
    },
  ];
}

export function emptyState(): RollState {
  const classes = seedClasses();
  return { classes, marks: {}, activeClassId: classes[0]?.id ?? "" };
}

export function isoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(iso: string, amount: number) {
  const date = parseISO(iso);
  date.setDate(date.getDate() + amount);
  return isoDate(date);
}

export function todayISO() {
  return isoDate(new Date());
}

export function formatLong(iso: string) {
  return parseISO(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShort(iso: string) {
  return parseISO(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function weekdayLabel(iso: string) {
  return parseISO(iso).toLocaleDateString("en-US", { weekday: "short" });
}

export function schoolWeek(iso: string) {
  const date = parseISO(iso);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(iso, mondayOffset);
  return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
}

export function previousWeekdays(from: string, count: number) {
  const days: string[] = [];
  let cursor = from;
  while (days.length < count) {
    cursor = addDays(cursor, -1);
    const dow = parseISO(cursor).getDay();
    if (dow !== 0 && dow !== 6) days.push(cursor);
  }
  return days;
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 33 + value.charCodeAt(i)) >>> 0;
  return h;
}

export function withSampleHistory(base: RollState, today: string): RollState {
  const days = previousWeekdays(today, 10);
  const marks: Record<string, Status> = { ...base.marks };
  for (const classroom of base.classes) {
    classroom.students.forEach((pupil, index) => {
      for (const date of days) {
        const n = (hash(`${pupil.id}:${date}`) + (index > classroom.students.length - 3 ? 14 : 0)) % 100;
        let status: Status = "present";
        if (n >= 96) status = "excused";
        else if (n >= 88) status = "absent";
        else if (n >= 78) status = "late";
        marks[markKey(classroom.id, date, pupil.id)] = status;
      }
    });
  }
  return { ...base, marks };
}

export function parseState(raw: unknown): RollState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<RollState>;
  if (!Array.isArray(value.classes) || !value.marks || typeof value.marks !== "object") return null;
  if (typeof value.activeClassId !== "string") return null;
  const classes = value.classes.filter(
    (classroom): classroom is Classroom =>
      !!classroom &&
      typeof classroom.id === "string" &&
      typeof classroom.name === "string" &&
      typeof classroom.detail === "string" &&
      Array.isArray(classroom.students),
  );
  if (classes.length === 0) return null;
  const activeClassId = classes.some((classroom) => classroom.id === value.activeClassId)
    ? value.activeClassId
    : classes[0].id;
  return { classes, marks: value.marks as Record<string, Status>, activeClassId };
}

export function loadState(): RollState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveState(state: RollState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export type DayCounts = Record<Status | "unmarked", number>;

export function dayCounts(classroom: Classroom, marks: Record<string, Status>, date: string): DayCounts {
  const counts: DayCounts = { present: 0, late: 0, absent: 0, excused: 0, unmarked: 0 };
  for (const pupil of classroom.students) {
    const status = marks[markKey(classroom.id, date, pupil.id)];
    if (!status) counts.unmarked += 1;
    else counts[status] += 1;
  }
  return counts;
}

export function attendedRate(counts: DayCounts, total: number) {
  if (total === 0) return 0;
  return Math.round(((counts.present + counts.late) / total) * 100);
}

export function studentRecord(state: RollState, classId: string, studentId: string) {
  const rows: { date: string; status: Status }[] = [];
  const needle = `|${studentId}`;
  for (const [key, status] of Object.entries(state.marks)) {
    if (!key.startsWith(`${classId}|`) || !key.endsWith(needle)) continue;
    const date = key.split("|")[1];
    if (!date || !STATUS_ORDER.includes(status)) continue;
    rows.push({ date, status });
  }
  rows.sort((a, b) => b.date.localeCompare(a.date));
  const attended = rows.filter((row) => row.status === "present" || row.status === "late").length;
  const rate = rows.length === 0 ? null : Math.round((attended / rows.length) * 100);
  return { rows: rows.slice(0, 10), rate, marked: rows.length };
}

export function nextRoll(classroom: Classroom) {
  const numbers = classroom.students.map((pupil) => Number(pupil.roll)).filter((n) => Number.isFinite(n));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
  return String(next).padStart(2, "0");
}

export function slugId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `${base || "class"}-${Math.random().toString(36).slice(2, 6)}`;
}
