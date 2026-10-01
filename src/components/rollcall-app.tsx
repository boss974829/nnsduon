import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  addDays,
  attendedRate,
  dayCounts,
  emptyState,
  formatLong,
  formatShort,
  loadState,
  markKey,
  nextRoll,
  saveState,
  schoolWeek,
  slugId,
  studentRecord,
  todayISO,
  weekdayLabel,
  withSampleHistory,
  type Classroom,
  type RollState,
  type Status,
  type Student,
} from "@/lib/rollcall";

const STATUS_META: Record<
  Status,
  { label: string; short: string; on: string; soft: string }
> = {
  present: {
    label: "Present",
    short: "P",
    on: "bg-primary text-surface",
    soft: "bg-primary-soft text-primary",
  },
  late: {
    label: "Late",
    short: "L",
    on: "bg-warn text-surface",
    soft: "bg-warn-soft text-warn",
  },
  absent: {
    label: "Absent",
    short: "A",
    on: "bg-danger text-surface",
    soft: "bg-danger-soft text-danger",
  },
  excused: {
    label: "Excused",
    short: "E",
    on: "bg-info text-surface",
    soft: "bg-info-soft text-info",
  },
};

export function RollcallApp() {
  const [ready, setReady] = useState(false);
  const [date, setDate] = useState(todayISO);
  const [state, setState] = useState<RollState>(emptyState);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [addingClass, setAddingClass] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const today = todayISO();
    const saved = loadState();
    setDate(today);
    setState(saved ?? withSampleHistory(emptyState(), today));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [ready, state]);

  const classroom = state.classes.find((item) => item.id === state.activeClassId) ?? state.classes[0];

  function update(next: RollState) {
    setState(next);
  }

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  }

  if (!ready) {
    return (
      <Shell notice={null}>
        <p className="text-sm font-medium tracking-wide text-primary">Class register</p>
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">Roll call</h1>
        <p className="mt-2 text-sm text-muted">Opening today’s register.</p>
      </Shell>
    );
  }

  if (!classroom) {
    return (
      <Shell notice={notice}>
        <EmptyClasses
          onCreate={(name, detail) => {
            const id = slugId(name);
            update({
              classes: [{ id, name, detail, students: [] }],
              marks: {},
              activeClassId: id,
            });
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell notice={notice}>
      <Header
        classroom={classroom}
        date={date}
        marks={state.marks}
        onDate={setDate}
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
        <ClassNav
          classes={state.classes}
          activeId={classroom.id}
          date={date}
          marks={state.marks}
          adding={addingClass}
          onAdding={setAddingClass}
          onSelect={(id) => {
            setOpenId(null);
            setQuery("");
            update({ ...state, activeClassId: id });
          }}
          onCreate={(name, detail) => {
            const id = slugId(name);
            update({
              ...state,
              classes: [...state.classes, { id, name, detail, students: [] }],
              activeClassId: id,
            });
            setAddingClass(false);
          }}
          onDelete={(id) => {
            const classes = state.classes.filter((item) => item.id !== id);
            update({
              ...state,
              classes,
              activeClassId: classes[0]?.id ?? "",
            });
          }}
        />
        <Roster
          classroom={classroom}
          date={date}
          state={state}
          query={query}
          openId={openId}
          onQuery={setQuery}
          onOpen={setOpenId}
          onMark={(studentId, status) => {
            const key = markKey(classroom.id, date, studentId);
            const marks = { ...state.marks };
            if (marks[key] === status) delete marks[key];
            else marks[key] = status;
            update({ ...state, marks });
          }}
          onAllPresent={() => {
            const marks = { ...state.marks };
            for (const pupil of classroom.students) {
              marks[markKey(classroom.id, date, pupil.id)] = "present";
            }
            update({ ...state, marks });
            flash("Everyone marked present");
          }}
          onClearDay={() => {
            const marks = { ...state.marks };
            for (const pupil of classroom.students) {
              delete marks[markKey(classroom.id, date, pupil.id)];
            }
            update({ ...state, marks });
          }}
          onAddStudent={(name) => {
            const roll = nextRoll(classroom);
            const pupil: Student = { id: `${classroom.id}-${roll}-${Date.now().toString(36)}`, name, roll };
            update({
              ...state,
              classes: state.classes.map((item) =>
                item.id === classroom.id ? { ...item, students: [...item.students, pupil] } : item,
              ),
            });
            setQuery("");
          }}
          onRemoveStudent={(studentId) => {
            update({
              ...state,
              classes: state.classes.map((item) =>
                item.id === classroom.id
                  ? { ...item, students: item.students.filter((pupil) => pupil.id !== studentId) }
                  : item,
              ),
            });
            setOpenId(null);
          }}
          onCopy={async () => {
            const text = absenceNote(classroom, date, state.marks);
            try {
              await navigator.clipboard.writeText(text);
              flash("Absence note copied");
            } catch {
              flash("Could not copy — select the note instead");
            }
          }}
          onReset={() => {
            const today = todayISO();
            setDate(today);
            setOpenId(null);
            setQuery("");
            update(withSampleHistory(emptyState(), today));
            flash("Sample register restored");
          }}
        />
      </div>
    </Shell>
  );
}

function Shell({ children, notice }: { children: ReactNode; notice: string | null }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {children}
      {notice ? (
        <p className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-surface shadow-lg">
          {notice}
        </p>
      ) : null}
    </main>
  );
}

function Header({
  classroom,
  date,
  marks,
  onDate,
}: {
  classroom: Classroom;
  date: string;
  marks: Record<string, Status>;
  onDate: (date: string) => void;
}) {
  const counts = dayCounts(classroom, marks, date);
  const rate = attendedRate(counts, classroom.students.length);
  const days = schoolWeek(date);
  const today = todayISO();

  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary">Class register</p>
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">Roll call</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Tap a mark for each student. Today stays open until you fill it. Saved on this device.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md border border-line bg-surface text-ink"
            aria-label="Previous day"
            onClick={() => onDate(addDays(date, -1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <label className="flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-muted" />
            <span className="sr-only">Register date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => event.target.value && onDate(event.target.value)}
              className="bg-transparent text-ink outline-none"
            />
          </label>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md border border-line bg-surface text-ink"
            aria-label="Next day"
            onClick={() => onDate(addDays(date, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="mt-4 font-display text-xl text-ink">{formatLong(date)}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Present" value={counts.present} tone="bg-primary-soft text-primary" />
        <Stat label="Late" value={counts.late} tone="bg-warn-soft text-warn" />
        <Stat label="Absent" value={counts.absent} tone="bg-danger-soft text-danger" />
        <Stat label="Here" value={`${rate}%`} tone="bg-surface text-ink" hint={`${counts.unmarked} still open`} />
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {days.map((day) => {
          const dayCount = dayCounts(classroom, marks, day);
          const marked = classroom.students.length - dayCount.unmarked;
          const active = day === date;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onDate(day)}
              className={`rounded-md border px-2 py-2 text-left ${
                active ? "border-primary bg-primary-soft" : "border-line bg-surface"
              }`}
            >
              <span className="block text-xs text-muted">
                {weekdayLabel(day)}
                {day === today ? " · today" : ""}
              </span>
              <span className="mt-1 block text-sm font-medium tabular-nums">
                {marked === 0 ? "—" : `${attendedRate(dayCount, classroom.students.length)}%`}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  tone: string;
  hint?: string;
}) {
  return (
    <div className={`rounded-lg border border-line px-4 py-3 ${tone}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="font-display text-3xl tabular-nums leading-none mt-1">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function ClassNav({
  classes,
  activeId,
  date,
  marks,
  adding,
  onAdding,
  onSelect,
  onCreate,
  onDelete,
}: {
  classes: Classroom[];
  activeId: string;
  date: string;
  marks: Record<string, Status>;
  adding: boolean;
  onAdding: (open: boolean) => void;
  onSelect: (id: string) => void;
  onCreate: (name: string, detail: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <aside className="min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted">Classes</h2>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-primary"
          onClick={() => onAdding(!adding)}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {adding ? <ClassForm onCancel={() => onAdding(false)} onCreate={onCreate} /> : null}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {classes.map((classroom) => {
          const counts = dayCounts(classroom, marks, date);
          const active = classroom.id === activeId;
          return (
            <div
              key={classroom.id}
              className={`min-w-52 shrink-0 rounded-lg border p-3 lg:min-w-0 ${
                active ? "border-primary bg-primary-soft" : "border-line bg-surface"
              }`}
            >
              <button type="button" className="w-full text-left" onClick={() => onSelect(classroom.id)}>
                <span className="block font-medium">{classroom.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{classroom.detail}</span>
                <span className="mt-2 block text-xs tabular-nums text-muted">
                  {classroom.students.length} students · {counts.unmarked} open
                </span>
              </button>
              {active && classes.length > 1 ? (
                <button
                  type="button"
                  className="mt-2 inline-flex h-11 items-center gap-1 text-xs text-danger"
                  onClick={() => onDelete(classroom.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove class
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function ClassForm({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, detail: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  return (
    <form
      className="mt-2 grid gap-2 rounded-lg border border-line bg-surface p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onCreate(trimmed, detail.trim() || "New class");
        setName("");
        setDetail("");
      }}
    >
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Class name"
        aria-label="Class name"
        className="h-11 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-primary"
      />
      <input
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
        placeholder="When it meets"
        aria-label="When it meets"
        className="h-11 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button type="submit" className="h-11 flex-1 rounded-md bg-primary text-sm font-medium text-surface">
          Create class
        </button>
        <button type="button" className="h-11 rounded-md px-3 text-sm text-muted" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function Roster({
  classroom,
  date,
  state,
  query,
  openId,
  onQuery,
  onOpen,
  onMark,
  onAllPresent,
  onClearDay,
  onAddStudent,
  onRemoveStudent,
  onCopy,
  onReset,
}: {
  classroom: Classroom;
  date: string;
  state: RollState;
  query: string;
  openId: string | null;
  onQuery: (value: string) => void;
  onOpen: (id: string | null) => void;
  onMark: (studentId: string, status: Status) => void;
  onAllPresent: () => void;
  onClearDay: () => void;
  onAddStudent: (name: string) => void;
  onRemoveStudent: (studentId: string) => void;
  onCopy: () => void;
  onReset: () => void;
}) {
  const [name, setName] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return classroom.students;
    return classroom.students.filter(
      (pupil) => pupil.name.toLowerCase().includes(q) || pupil.roll.includes(q),
    );
  }, [classroom.students, query]);

  const watch = classroom.students
    .map((pupil) => ({ pupil, record: studentRecord(state, classroom.id, pupil.id) }))
    .filter((item) => item.record.rate !== null && item.record.rate < 90)
    .sort((a, b) => (a.record.rate ?? 0) - (b.record.rate ?? 0))
    .slice(0, 3);

  return (
    <section className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">{classroom.name}</h2>
          <p className="text-sm text-muted">{classroom.detail}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAllPresent}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-surface"
          >
            <Check className="h-4 w-4" />
            All present
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium"
          >
            <ClipboardCopy className="h-4 w-4" />
            Copy note
          </button>
        </div>
      </div>

      {watch.length > 0 ? (
        <div className="mt-4 rounded-lg border border-line bg-warn-soft px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-warn">Worth a check</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink">
            {watch.map(({ pupil, record }) => (
              <li key={pupil.id}>
                {pupil.name} · {record.rate}%
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <span className="sr-only">Search students</span>
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search name or roll"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) return;
            onAddStudent(trimmed);
            setName("");
          }}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Add a student"
            aria-label="Student name"
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center gap-1 rounded-md border border-line bg-surface px-3 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>
      </div>

      <ul className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        {filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-muted">
            {classroom.students.length === 0
              ? "This class has no students yet. Add the first name above."
              : "No students match that search."}
          </li>
        ) : (
          filtered.map((pupil) => {
            const status = state.marks[markKey(classroom.id, date, pupil.id)];
            const open = openId === pupil.id;
            const record = open ? studentRecord(state, classroom.id, pupil.id) : null;
            return (
              <li key={pupil.id} className="border-b border-line last:border-b-0">
                <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => onOpen(open ? null : pupil.id)}
                    aria-expanded={open}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-bg font-medium tabular-nums text-ink">
                      {pupil.roll}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{pupil.name}</span>
                      <span className="block text-xs text-muted">
                        {status ? STATUS_META[status].label : "Not marked"}
                      </span>
                    </span>
                  </button>
                  <div className="grid grid-cols-4 gap-1 sm:w-72">
                    {(Object.keys(STATUS_META) as Status[]).map((key) => {
                      const meta = STATUS_META[key];
                      const selected = status === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          aria-label={`${meta.label} for ${pupil.name}`}
                          aria-pressed={selected}
                          onClick={() => onMark(pupil.id, key)}
                          className={`h-11 rounded-md text-sm font-medium ${
                            selected ? meta.on : "bg-bg text-ink"
                          }`}
                        >
                          <span className="sm:hidden">{meta.short}</span>
                          <span className="hidden sm:inline">{meta.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {open && record ? (
                  <div className="border-t border-line bg-bg px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm">
                        <UserRound className="mr-1 inline h-4 w-4 text-muted" />
                        {record.rate === null
                          ? "No earlier marks yet."
                          : `${record.rate}% here across ${record.marked} marked days.`}
                      </p>
                      <button
                        type="button"
                        className="inline-flex h-11 items-center gap-1 text-sm text-danger"
                        onClick={() => onRemoveStudent(pupil.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                    {record.rows.length > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {record.rows.map((row) => (
                          <li
                            key={row.date}
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_META[row.status].soft}`}
                          >
                            {formatShort(row.date)} · {STATUS_META[row.status].label}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <button type="button" className="inline-flex h-11 items-center gap-1" onClick={onClearDay}>
          <X className="h-4 w-4" />
          Clear this day
        </button>
        <button type="button" className="inline-flex h-11 items-center gap-1" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Restore sample classes
        </button>
      </div>
    </section>
  );
}

function EmptyClasses({ onCreate }: { onCreate: (name: string, detail: string) => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="font-display text-4xl">Roll call</h1>
      <p className="mt-2 text-sm text-muted">Start with one class. You can add students after.</p>
      <div className="mt-6">
        <ClassForm onCreate={onCreate} onCancel={() => undefined} />
      </div>
    </div>
  );
}

function absenceNote(classroom: Classroom, date: string, marks: Record<string, Status>) {
  const counts = dayCounts(classroom, marks, date);
  const lines = [`${classroom.name} — ${formatLong(date)}`];
  lines.push(
    `Present ${counts.present} · Late ${counts.late} · Absent ${counts.absent} · Excused ${counts.excused}`,
  );
  for (const status of ["absent", "late", "excused"] as Status[]) {
    const names = classroom.students
      .filter((pupil) => marks[markKey(classroom.id, date, pupil.id)] === status)
      .map((pupil) => `${pupil.name} (${pupil.roll})`);
    if (names.length) lines.push(`${STATUS_META[status].label}: ${names.join(", ")}`);
  }
  if (counts.unmarked) lines.push(`${counts.unmarked} not marked yet.`);
  return lines.join("\n");
}
