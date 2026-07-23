const STORAGE_KEY = "phoom-ai-workflow-dashboard";

const seedWorkflows = [
  {
    id: createId(),
    name: "Client intake summary",
    problem: "New requests arrive in different formats and take time to understand.",
    process: "Read messages manually, extract key details, and write a short summary.",
    idea: "Use AI to summarize requests into scope, urgency, missing info, and next action.",
    nextStep: "Create prompt template and test with 10 sample requests",
    category: "AI Assistant",
    status: "Live",
    impact: "High",
    hours: 5,
  },
  {
    id: createId(),
    name: "Sales reconciliation dashboard",
    problem: "Sales records and transfer records do not always match.",
    process: "Compare rows manually in spreadsheets and mark exceptions.",
    idea: "Build a dashboard that imports CSV files, flags mismatches, and summarizes totals.",
    nextStep: "Define required CSV columns",
    category: "Data Dashboard",
    status: "Build",
    impact: "High",
    hours: 7,
  },
  {
    id: createId(),
    name: "LINE notification flow",
    problem: "Important status updates are easy to miss.",
    process: "Check spreadsheets and send manual update messages.",
    idea: "Trigger LINE messages when a status changes or a deadline is near.",
    nextStep: "Map message events and API fields",
    category: "API Integration",
    status: "Idea",
    impact: "Medium",
    hours: 3,
  },
  {
    id: createId(),
    name: "Weekly task report",
    problem: "It is hard to see what was completed, blocked, or delayed each week.",
    process: "Review notes manually and write a weekly summary.",
    idea: "Generate a weekly report from task data with AI-assisted summaries.",
    nextStep: "Design report format",
    category: "Operations Tool",
    status: "Build",
    impact: "Medium",
    hours: 2,
  },
  {
    id: createId(),
    name: "Inventory exception monitor",
    problem: "Stock differences are found late after manual checking.",
    process: "Open inventory files and compare expected vs actual quantities.",
    idea: "Create an exception dashboard that highlights unusual changes and missing stock.",
    nextStep: "Prepare sample inventory data",
    category: "Data Dashboard",
    status: "Idea",
    impact: "High",
    hours: 6,
  },
];

const colors = {
  Idea: "#e6a23a",
  Build: "#2f6fed",
  Live: "#1f8a70",
  "AI Assistant": "#1f8a70",
  "Data Dashboard": "#2f6fed",
  "API Integration": "#d75a4a",
  "Operations Tool": "#7c5cc4",
};

const rowsEl = document.querySelector("#workflowRows");
const form = document.querySelector("#workflowForm");
const filterButtons = document.querySelectorAll("[data-filter]");
const exportButton = document.querySelector("#exportCsv");
const resetButton = document.querySelector("#resetDemo");
const focusButton = document.querySelector("#focusForm");
const statusChart = document.querySelector("#statusChart");
const categoryChart = document.querySelector("#categoryChart");
const categoryLegend = document.querySelector("#categoryLegend");

let activeFilter = "all";
let workflows = loadWorkflows();

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `workflow-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeWorkflow(item) {
  return {
    id: item.id || createId(),
    name: item.name || "Untitled workflow",
    problem: item.problem || "",
    process: item.process || "",
    idea: item.idea || "",
    nextStep: item.nextStep || "Review and define next action",
    category: item.category || "Operations Tool",
    status: item.status || "Idea",
    impact: item.impact || "Medium",
    hours: Number(item.hours || 0),
  };
}

function loadWorkflows() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedWorkflows));
    return seedWorkflows.map(normalizeWorkflow);
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return seedWorkflows.map(normalizeWorkflow);

    const normalized = parsed.map(normalizeWorkflow);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return seedWorkflows.map(normalizeWorkflow);
  }
}

function saveWorkflows() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

function countBy(field) {
  return workflows.reduce((acc, item) => {
    acc[item[field]] = (acc[item[field]] || 0) + 1;
    return acc;
  }, {});
}

function getPriorityScore(item) {
  const impactWeight = {
    High: 3,
    Medium: 2,
    Low: 1,
  };
  const hoursScore = Math.min(Number(item.hours || 0), 40) * 2;
  return (impactWeight[item.impact] || 1) * 10 + hoursScore;
}

function renderMetrics() {
  const inProgress = workflows.filter((item) => item.status === "Build").length;
  const totalHours = workflows.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const topPriority = workflows.reduce((max, item) => Math.max(max, getPriorityScore(item)), 0);

  document.querySelector("#metricTotal").textContent = workflows.length;
  document.querySelector("#metricProgress").textContent = inProgress;
  document.querySelector("#metricHours").textContent = totalHours;
  document.querySelector("#metricPriority").textContent = topPriority;
}

function renderRows() {
  const sourceRows = activeFilter === "all"
    ? workflows
    : workflows.filter((item) => item.status === activeFilter);
  const visibleRows = [...sourceRows].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  rowsEl.innerHTML = "";

  if (visibleRows.length === 0) {
    rowsEl.innerHTML = `
      <tr>
        <td colspan="8" class="muted">No workflows match this filter.</td>
      </tr>
    `;
    return;
  }

  visibleRows.forEach((item) => {
    const row = document.createElement("tr");
    const detail = item.problem || item.idea || "No problem statement added yet.";
    row.innerHTML = `
      <td>
        <div class="workflow-name">${escapeHtml(item.name)}</div>
        <div class="workflow-detail">${escapeHtml(detail)}</div>
        <div class="muted">ID ${item.id.slice(0, 8)}</div>
      </td>
      <td>${escapeHtml(item.category)}</td>
      <td><span class="pill ${item.status}">${item.status}</span></td>
      <td><span class="impact ${item.impact}">${item.impact}</span></td>
      <td>${Number(item.hours || 0)}h</td>
      <td><span class="priority-score">${getPriorityScore(item)}</span></td>
      <td>${escapeHtml(item.nextStep)}</td>
      <td><button class="delete-button" type="button" data-delete="${item.id}">Delete</button></td>
    `;
    rowsEl.appendChild(row);
  });
}

function drawBarChart() {
  const ctx = statusChart.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = statusChart.clientWidth;
  const height = 320;
  statusChart.width = width * ratio;
  statusChart.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const data = ["Idea", "Build", "Live"].map((status) => ({
    label: status,
    value: workflows.filter((item) => item.status === status).length,
    color: colors[status],
  }));

  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const chartLeft = 92;
  const chartRight = 24;
  const barHeight = 42;
  const gap = 34;
  const top = 44;

  ctx.font = "700 14px Inter, sans-serif";
  ctx.textBaseline = "middle";

  data.forEach((item, index) => {
    const y = top + index * (barHeight + gap);
    const barWidth = ((width - chartLeft - chartRight) * item.value) / maxValue;

    ctx.fillStyle = "#68717d";
    ctx.fillText(item.label, 0, y + barHeight / 2);

    ctx.fillStyle = "#edf2ef";
    roundRect(ctx, chartLeft, y, width - chartLeft - chartRight, barHeight, 8);
    ctx.fill();

    ctx.fillStyle = item.color;
    roundRect(ctx, chartLeft, y, Math.max(barWidth, item.value > 0 ? 12 : 0), barHeight, 8);
    ctx.fill();

    ctx.fillStyle = "#1d252f";
    ctx.fillText(String(item.value), chartLeft + Math.max(barWidth, 18) + 12, y + barHeight / 2);
  });
}

function drawDonutChart() {
  const ctx = categoryChart.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const size = 220;
  categoryChart.width = size * ratio;
  categoryChart.height = size * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, size, size);

  const counts = countBy("category");
  const entries = Object.entries(counts);
  const total = Math.max(1, workflows.length);
  const center = size / 2;
  let start = -Math.PI / 2;

  entries.forEach(([label, value]) => {
    const slice = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, 92, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = colors[label] || "#68717d";
    ctx.fill();
    start += slice;
  });

  ctx.beginPath();
  ctx.arc(center, center, 54, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.fillStyle = "#1d252f";
  ctx.font = "800 30px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(workflows.length), center, center - 8);
  ctx.fillStyle = "#68717d";
  ctx.font = "700 12px Inter, sans-serif";
  ctx.fillText("items", center, center + 22);

  categoryLegend.innerHTML = entries
    .map(
      ([label, value]) => `
        <div class="legend-item">
          <span class="legend-swatch" style="background:${colors[label] || "#68717d"}"></span>
          <span>${escapeHtml(label)}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function exportCsv() {
  const headers = [
    "Name",
    "Problem",
    "Current Process",
    "Automation Idea",
    "Next Step",
    "Category",
    "Status",
    "Impact",
    "Hours Saved Per Week",
    "Priority Score",
  ];

  const rows = workflows.map((item) => [
    item.name,
    item.problem,
    item.process,
    item.idea,
    item.nextStep,
    item.category,
    item.status,
    item.impact,
    item.hours,
    getPriorityScore(item),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ai-workflow-opportunities.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function roundRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  renderMetrics();
  renderRows();
  drawBarChart();
  drawDonutChart();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const newWorkflow = normalizeWorkflow({
    id: createId(),
    name: String(formData.get("name") || "").trim(),
    problem: String(formData.get("problem") || "").trim(),
    process: String(formData.get("process") || "").trim(),
    idea: String(formData.get("idea") || "").trim(),
    nextStep: String(formData.get("nextStep") || "").trim(),
    category: formData.get("category"),
    status: formData.get("status"),
    impact: formData.get("impact"),
    hours: Number(formData.get("hours") || 0),
  });

  workflows = [newWorkflow, ...workflows];
  saveWorkflows();
  form.reset();
  document.querySelector("#hoursInput").value = 2;
  render();
});

rowsEl.addEventListener("click", (event) => {
  const deleteId = event.target.dataset.delete;
  if (!deleteId) return;

  workflows = workflows.filter((item) => item.id !== deleteId);
  saveWorkflows();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderRows();
  });
});

exportButton.addEventListener("click", exportCsv);

resetButton.addEventListener("click", () => {
  workflows = seedWorkflows.map((item) => normalizeWorkflow({ ...item, id: createId() }));
  saveWorkflows();
  render();
});

focusButton.addEventListener("click", () => {
  document.querySelector("#add").scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#nameInput").focus();
});

window.addEventListener("resize", () => {
  drawBarChart();
  drawDonutChart();
});

render();
