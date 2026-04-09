const API = "http://127.0.0.1:8000";

export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function signup(formData) {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Signup failed");
  return data;
}

export async function googleAuth() {
  const res = await fetch(`${API}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "google_user@gmail.com" }),
  });
  return res.json();
}

export async function fetchCoordinator() {
  const student_id = localStorage.getItem("student_id") || 1;
  const res = await fetch(`${API}/api/coordinator?student_id=${student_id}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export async function fetchContext() {
  const res = await fetch(`${API}/api/context`);
  return res.json();
}

// ── Faculty Endpoints ──

export async function facultyAddTask(student_id, task_name, subject, due_date, priority) {
  const res = await fetch(`${API}/api/faculty/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id, task_name, subject, due_date, priority }),
  });
  return res.json();
}

export async function facultyAddSchedule(student_id, day, subject, time, room) {
  const res = await fetch(`${API}/api/faculty/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id, day, subject, time, room }),
  });
  return res.json();
}

export async function facultyUpdateAttendance(student_id, attendance, subject) {
  const res = await fetch(`${API}/api/faculty/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id, attendance, subject }),
  });
  return res.json();
}



export async function addPlacementDrive(drive) {
  const res = await fetch(`${API}/api/placement/drive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(drive),
  });
  return res.json();
}

export async function addCanteenMenu(item) {
  const res = await fetch(`${API}/api/canteen/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return res.json();
}

export async function updateCanteenCrowd(crowd_percent) {
  const res = await fetch(`${API}/api/canteen/crowd`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crowd_percent }),
  });
  return res.json();
}

