import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Search, c as ClipboardCopy, d as Check, f as CalendarDays, i as Trash2, l as ChevronRight, n as UserRound, o as RotateCcw, s as Plus, t as X, u as ChevronLeft } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-FuVenULl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STORAGE_KEY = "rollcall.v1";
var STATUS_ORDER = [
	"present",
	"late",
	"absent",
	"excused"
];
function markKey(classId, date, studentId) {
	return `${classId}|${date}|${studentId}`;
}
function student(classId, roll, name) {
	return {
		id: `${classId}-${roll}`,
		roll,
		name
	};
}
function seedClasses() {
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
				student("homeroom-8a", "12", "Evan Cho")
			]
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
				student("biology-10", "10", "Jack Murray")
			]
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
				student("art-club", "08", "Quinn Harper")
			]
		}
	];
}
function emptyState() {
	const classes = seedClasses();
	return {
		classes,
		marks: {},
		activeClassId: classes[0]?.id ?? ""
	};
}
function isoDate(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function parseISO(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function addDays(iso, amount) {
	const date = parseISO(iso);
	date.setDate(date.getDate() + amount);
	return isoDate(date);
}
function todayISO() {
	return isoDate(/* @__PURE__ */ new Date());
}
function formatLong(iso) {
	return parseISO(iso).toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric"
	});
}
function formatShort(iso) {
	return parseISO(iso).toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric"
	});
}
function weekdayLabel(iso) {
	return parseISO(iso).toLocaleDateString("en-US", { weekday: "short" });
}
function schoolWeek(iso) {
	const day = parseISO(iso).getDay();
	const monday = addDays(iso, day === 0 ? -6 : 1 - day);
	return Array.from({ length: 5 }, (_, index) => addDays(monday, index));
}
function previousWeekdays(from, count) {
	const days = [];
	let cursor = from;
	while (days.length < count) {
		cursor = addDays(cursor, -1);
		const dow = parseISO(cursor).getDay();
		if (dow !== 0 && dow !== 6) days.push(cursor);
	}
	return days;
}
function hash(value) {
	let h = 0;
	for (let i = 0; i < value.length; i++) h = h * 33 + value.charCodeAt(i) >>> 0;
	return h;
}
function withSampleHistory(base, today) {
	const days = previousWeekdays(today, 10);
	const marks = { ...base.marks };
	for (const classroom of base.classes) classroom.students.forEach((pupil, index) => {
		for (const date of days) {
			const n = (hash(`${pupil.id}:${date}`) + (index > classroom.students.length - 3 ? 14 : 0)) % 100;
			let status = "present";
			if (n >= 96) status = "excused";
			else if (n >= 88) status = "absent";
			else if (n >= 78) status = "late";
			marks[markKey(classroom.id, date, pupil.id)] = status;
		}
	});
	return {
		...base,
		marks
	};
}
function parseState(raw) {
	if (!raw || typeof raw !== "object") return null;
	const value = raw;
	if (!Array.isArray(value.classes) || !value.marks || typeof value.marks !== "object") return null;
	if (typeof value.activeClassId !== "string") return null;
	const classes = value.classes.filter((classroom) => !!classroom && typeof classroom.id === "string" && typeof classroom.name === "string" && typeof classroom.detail === "string" && Array.isArray(classroom.students));
	if (classes.length === 0) return null;
	const activeClassId = classes.some((classroom) => classroom.id === value.activeClassId) ? value.activeClassId : classes[0].id;
	return {
		classes,
		marks: value.marks,
		activeClassId
	};
}
function loadState() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		return parseState(JSON.parse(raw));
	} catch {
		return null;
	}
}
function saveState(state) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function dayCounts(classroom, marks, date) {
	const counts = {
		present: 0,
		late: 0,
		absent: 0,
		excused: 0,
		unmarked: 0
	};
	for (const pupil of classroom.students) {
		const status = marks[markKey(classroom.id, date, pupil.id)];
		if (!status) counts.unmarked += 1;
		else counts[status] += 1;
	}
	return counts;
}
function attendedRate(counts, total) {
	if (total === 0) return 0;
	return Math.round((counts.present + counts.late) / total * 100);
}
function studentRecord(state, classId, studentId) {
	const rows = [];
	const needle = `|${studentId}`;
	for (const [key, status] of Object.entries(state.marks)) {
		if (!key.startsWith(`${classId}|`) || !key.endsWith(needle)) continue;
		const date = key.split("|")[1];
		if (!date || !STATUS_ORDER.includes(status)) continue;
		rows.push({
			date,
			status
		});
	}
	rows.sort((a, b) => b.date.localeCompare(a.date));
	const attended = rows.filter((row) => row.status === "present" || row.status === "late").length;
	const rate = rows.length === 0 ? null : Math.round(attended / rows.length * 100);
	return {
		rows: rows.slice(0, 10),
		rate,
		marked: rows.length
	};
}
function nextRoll(classroom) {
	const numbers = classroom.students.map((pupil) => Number(pupil.roll)).filter((n) => Number.isFinite(n));
	const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
	return String(next).padStart(2, "0");
}
function slugId(name) {
	return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "class"}-${Math.random().toString(36).slice(2, 6)}`;
}
var STATUS_META = {
	present: {
		label: "Present",
		short: "P",
		on: "bg-primary text-surface",
		soft: "bg-primary-soft text-primary"
	},
	late: {
		label: "Late",
		short: "L",
		on: "bg-warn text-surface",
		soft: "bg-warn-soft text-warn"
	},
	absent: {
		label: "Absent",
		short: "A",
		on: "bg-danger text-surface",
		soft: "bg-danger-soft text-danger"
	},
	excused: {
		label: "Excused",
		short: "E",
		on: "bg-info text-surface",
		soft: "bg-info-soft text-info"
	}
};
function RollcallApp() {
	const [ready, setReady] = (0, import_react.useState)(false);
	const [date, setDate] = (0, import_react.useState)(todayISO);
	const [state, setState] = (0, import_react.useState)(emptyState);
	const [query, setQuery] = (0, import_react.useState)("");
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [addingClass, setAddingClass] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const today = todayISO();
		const saved = loadState();
		setDate(today);
		setState(saved ?? withSampleHistory(emptyState(), today));
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		saveState(state);
	}, [ready, state]);
	const classroom = state.classes.find((item) => item.id === state.activeClassId) ?? state.classes[0];
	function update(next) {
		setState(next);
	}
	function flash(message) {
		setNotice(message);
		window.setTimeout(() => setNotice(null), 2200);
	}
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		notice: null,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium tracking-wide text-primary",
				children: "Class register"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl font-medium tracking-tight sm:text-5xl",
				children: "Roll call"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Opening today’s register."
			})
		]
	});
	if (!classroom) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		notice,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyClasses, { onCreate: (name, detail) => {
			const id = slugId(name);
			update({
				classes: [{
					id,
					name,
					detail,
					students: []
				}],
				marks: {},
				activeClassId: id
			});
		} })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		notice,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
			classroom,
			date,
			marks: state.marks,
			onDate: setDate
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassNav, {
				classes: state.classes,
				activeId: classroom.id,
				date,
				marks: state.marks,
				adding: addingClass,
				onAdding: setAddingClass,
				onSelect: (id) => {
					setOpenId(null);
					setQuery("");
					update({
						...state,
						activeClassId: id
					});
				},
				onCreate: (name, detail) => {
					const id = slugId(name);
					update({
						...state,
						classes: [...state.classes, {
							id,
							name,
							detail,
							students: []
						}],
						activeClassId: id
					});
					setAddingClass(false);
				},
				onDelete: (id) => {
					const classes = state.classes.filter((item) => item.id !== id);
					update({
						...state,
						classes,
						activeClassId: classes[0]?.id ?? ""
					});
				}
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Roster, {
				classroom,
				date,
				state,
				query,
				openId,
				onQuery: setQuery,
				onOpen: setOpenId,
				onMark: (studentId, status) => {
					const key = markKey(classroom.id, date, studentId);
					const marks = { ...state.marks };
					if (marks[key] === status) delete marks[key];
					else marks[key] = status;
					update({
						...state,
						marks
					});
				},
				onAllPresent: () => {
					const marks = { ...state.marks };
					for (const pupil of classroom.students) marks[markKey(classroom.id, date, pupil.id)] = "present";
					update({
						...state,
						marks
					});
					flash("Everyone marked present");
				},
				onClearDay: () => {
					const marks = { ...state.marks };
					for (const pupil of classroom.students) delete marks[markKey(classroom.id, date, pupil.id)];
					update({
						...state,
						marks
					});
				},
				onAddStudent: (name) => {
					const roll = nextRoll(classroom);
					const pupil = {
						id: `${classroom.id}-${roll}-${Date.now().toString(36)}`,
						name,
						roll
					};
					update({
						...state,
						classes: state.classes.map((item) => item.id === classroom.id ? {
							...item,
							students: [...item.students, pupil]
						} : item)
					});
					setQuery("");
				},
				onRemoveStudent: (studentId) => {
					update({
						...state,
						classes: state.classes.map((item) => item.id === classroom.id ? {
							...item,
							students: item.students.filter((pupil) => pupil.id !== studentId)
						} : item)
					});
					setOpenId(null);
				},
				onCopy: async () => {
					const text = absenceNote(classroom, date, state.marks);
					try {
						await navigator.clipboard.writeText(text);
						flash("Absence note copied");
					} catch {
						flash("Could not copy — select the note instead");
					}
				},
				onReset: () => {
					const today = todayISO();
					setDate(today);
					setOpenId(null);
					setQuery("");
					update(withSampleHistory(emptyState(), today));
					flash("Sample register restored");
				}
			})]
		})]
	});
}
function Shell({ children, notice }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8",
		children: [children, notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "fixed bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm text-surface shadow-lg",
			children: notice
		}) : null]
	});
}
function Header({ classroom, date, marks, onDate }) {
	const counts = dayCounts(classroom, marks, date);
	const rate = attendedRate(counts, classroom.students.length);
	const days = schoolWeek(date);
	const today = todayISO();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium tracking-wide text-primary",
					children: "Class register"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl",
					children: "Roll call"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted",
					children: "Tap a mark for each student. Today stays open until you fill it. Saved on this device."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid h-11 w-11 place-items-center rounded-md border border-line bg-surface text-ink",
						"aria-label": "Previous day",
						onClick: () => onDate(addDays(date, -1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-4 w-4 text-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: "Register date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: date,
								onChange: (event) => event.target.value && onDate(event.target.value),
								className: "bg-transparent text-ink outline-none"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid h-11 w-11 place-items-center rounded-md border border-line bg-surface text-ink",
						"aria-label": "Next day",
						onClick: () => onDate(addDays(date, 1)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-5 w-5" })
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 font-display text-xl text-ink",
			children: formatLong(date)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Present",
					value: counts.present,
					tone: "bg-primary-soft text-primary"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Late",
					value: counts.late,
					tone: "bg-warn-soft text-warn"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Absent",
					value: counts.absent,
					tone: "bg-danger-soft text-danger"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Here",
					value: `${rate}%`,
					tone: "bg-surface text-ink",
					hint: `${counts.unmarked} still open`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-5 gap-2",
			children: days.map((day) => {
				const dayCount = dayCounts(classroom, marks, day);
				const marked = classroom.students.length - dayCount.unmarked;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onDate(day),
					className: `rounded-md border px-2 py-2 text-left ${day === date ? "border-primary bg-primary-soft" : "border-line bg-surface"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "block text-xs text-muted",
						children: [weekdayLabel(day), day === today ? " · today" : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm font-medium tabular-nums",
						children: marked === 0 ? "—" : `${attendedRate(dayCount, classroom.students.length)}%`
					})]
				}, day);
			})
		})
	] });
}
function Stat({ label, value, tone, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rounded-lg border border-line px-4 py-3 ${tone}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-wide opacity-80",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl tabular-nums leading-none mt-1",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function ClassNav({ classes, activeId, date, marks, adding, onAdding, onSelect, onCreate, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-muted",
					children: "Classes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-primary",
					onClick: () => onAdding(!adding),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Add"]
				})]
			}),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassForm, {
				onCancel: () => onAdding(false),
				onCreate
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible",
				children: classes.map((classroom) => {
					const counts = dayCounts(classroom, marks, date);
					const active = classroom.id === activeId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `min-w-52 shrink-0 rounded-lg border p-3 lg:min-w-0 ${active ? "border-primary bg-primary-soft" : "border-line bg-surface"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "w-full text-left",
							onClick: () => onSelect(classroom.id),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-medium",
									children: classroom.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs text-muted",
									children: classroom.detail
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-2 block text-xs tabular-nums text-muted",
									children: [
										classroom.students.length,
										" students · ",
										counts.unmarked,
										" open"
									]
								})
							]
						}), active && classes.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mt-2 inline-flex h-11 items-center gap-1 text-xs text-danger",
							onClick: () => onDelete(classroom.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), "Remove class"]
						}) : null]
					}, classroom.id);
				})
			})
		]
	});
}
function ClassForm({ onCreate, onCancel }) {
	const [name, setName] = (0, import_react.useState)("");
	const [detail, setDetail] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-2 grid gap-2 rounded-lg border border-line bg-surface p-3",
		onSubmit: (event) => {
			event.preventDefault();
			const trimmed = name.trim();
			if (!trimmed) return;
			onCreate(trimmed, detail.trim() || "New class");
			setName("");
			setDetail("");
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: name,
				onChange: (event) => setName(event.target.value),
				placeholder: "Class name",
				"aria-label": "Class name",
				className: "h-11 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: detail,
				onChange: (event) => setDetail(event.target.value),
				placeholder: "When it meets",
				"aria-label": "When it meets",
				className: "h-11 rounded-md border border-line bg-bg px-3 text-sm outline-none focus:border-primary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "h-11 flex-1 rounded-md bg-primary text-sm font-medium text-surface",
					children: "Create class"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "h-11 rounded-md px-3 text-sm text-muted",
					onClick: onCancel,
					children: "Cancel"
				})]
			})
		]
	});
}
function Roster({ classroom, date, state, query, openId, onQuery, onOpen, onMark, onAllPresent, onClearDay, onAddStudent, onRemoveStudent, onCopy, onReset }) {
	const [name, setName] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return classroom.students;
		return classroom.students.filter((pupil) => pupil.name.toLowerCase().includes(q) || pupil.roll.includes(q));
	}, [classroom.students, query]);
	const watch = classroom.students.map((pupil) => ({
		pupil,
		record: studentRecord(state, classroom.id, pupil.id)
	})).filter((item) => item.record.rate !== null && item.record.rate < 90).sort((a, b) => (a.record.rate ?? 0) - (b.record.rate ?? 0)).slice(0, 3);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: classroom.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: classroom.detail
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onAllPresent,
						className: "inline-flex h-11 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-surface",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }), "All present"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onCopy,
						className: "inline-flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCopy, { className: "h-4 w-4" }), "Copy note"]
					})]
				})]
			}),
			watch.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-lg border border-line bg-warn-soft px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wide text-warn",
					children: "Worth a check"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink",
					children: watch.map(({ pupil, record }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
						pupil.name,
						" · ",
						record.rate,
						"%"
					] }, pupil.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 shrink-0 text-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: "Search students"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (event) => onQuery(event.target.value),
							placeholder: "Search name or roll",
							className: "min-w-0 flex-1 bg-transparent text-sm outline-none"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex min-w-0 flex-1 gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						const trimmed = name.trim();
						if (!trimmed) return;
						onAddStudent(trimmed);
						setName("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Add a student",
						"aria-label": "Student name",
						className: "h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm outline-none focus:border-primary"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "submit",
						className: "inline-flex h-11 items-center gap-1 rounded-md border border-line bg-surface px-3 text-sm font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Add"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 overflow-hidden rounded-lg border border-line bg-surface",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-4 py-10 text-center text-sm text-muted",
					children: classroom.students.length === 0 ? "This class has no students yet. Add the first name above." : "No students match that search."
				}) : filtered.map((pupil) => {
					const status = state.marks[markKey(classroom.id, date, pupil.id)];
					const open = openId === pupil.id;
					const record = open ? studentRecord(state, classroom.id, pupil.id) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-b border-line last:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:px-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex min-w-0 flex-1 items-center gap-3 text-left",
								onClick: () => onOpen(open ? null : pupil.id),
								"aria-expanded": open,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-11 w-11 shrink-0 place-items-center rounded-md bg-bg font-medium tabular-nums text-ink",
									children: pupil.roll
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate font-medium",
										children: pupil.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted",
										children: status ? STATUS_META[status].label : "Not marked"
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-4 gap-1 sm:w-72",
								children: Object.keys(STATUS_META).map((key) => {
									const meta = STATUS_META[key];
									const selected = status === key;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-label": `${meta.label} for ${pupil.name}`,
										"aria-pressed": selected,
										onClick: () => onMark(pupil.id, key),
										className: `h-11 rounded-md text-sm font-medium ${selected ? meta.on : "bg-bg text-ink"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sm:hidden",
											children: meta.short
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: meta.label
										})]
									}, key);
								})
							})]
						}), open && record ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-line bg-bg px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "mr-1 inline h-4 w-4 text-muted" }), record.rate === null ? "No earlier marks yet." : `${record.rate}% here across ${record.marked} marked days.`]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "inline-flex h-11 items-center gap-1 text-sm text-danger",
									onClick: () => onRemoveStudent(pupil.id),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }), "Remove"]
								})]
							}), record.rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 flex flex-wrap gap-2",
								children: record.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: `rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_META[row.status].soft}`,
									children: [
										formatShort(row.date),
										" · ",
										STATUS_META[row.status].label
									]
								}, row.date))
							}) : null]
						}) : null]
					}, pupil.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-11 items-center gap-1",
					onClick: onClearDay,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }), "Clear this day"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-11 items-center gap-1",
					onClick: onReset,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }), "Restore sample classes"]
				})]
			})
		]
	});
}
function EmptyClasses({ onCreate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto mt-16 max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Roll call"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Start with one class. You can add students after."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassForm, {
					onCreate,
					onCancel: () => void 0
				})
			})
		]
	});
}
function absenceNote(classroom, date, marks) {
	const counts = dayCounts(classroom, marks, date);
	const lines = [`${classroom.name} — ${formatLong(date)}`];
	lines.push(`Present ${counts.present} · Late ${counts.late} · Absent ${counts.absent} · Excused ${counts.excused}`);
	for (const status of [
		"absent",
		"late",
		"excused"
	]) {
		const names = classroom.students.filter((pupil) => marks[markKey(classroom.id, date, pupil.id)] === status).map((pupil) => `${pupil.name} (${pupil.roll})`);
		if (names.length) lines.push(`${STATUS_META[status].label}: ${names.join(", ")}`);
	}
	if (counts.unmarked) lines.push(`${counts.unmarked} not marked yet.`);
	return lines.join("\n");
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RollcallApp, {});
}
//#endregion
export { Home as component };
