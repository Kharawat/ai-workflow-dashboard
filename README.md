# Project 02: AI Workflow Dashboard

A personal AI automation opportunity tracker for capturing repeated manual work,
turning it into workflow ideas, scoring priority, and planning next actions.

## Features

- KPI cards for total workflows, in-progress builds, weekly hours saved, and top priority score
- Status distribution chart
- Automation category donut chart
- Filterable workflow table
- Problem, current process, automation idea, and next step fields
- Priority scoring from impact and weekly hours saved
- CSV export for backup or spreadsheet review
- Add and delete workflow opportunities
- Browser `localStorage` persistence
- No framework or build step required

## How to Use

Open the live site and use the form at the bottom of the dashboard to capture
automation opportunities.

1. Write a clear `Workflow name`.
2. Describe the `Problem` this workflow should solve.
3. Explain the `Current process` and how the work is done manually today.
4. Add the `Automation idea`, such as AI summary, dashboard, API integration, or alert flow.
5. Add the `Next step` needed to move the idea forward.
6. Choose a `Category`, `Status`, and `Impact`.
7. Estimate `Hours saved per week`.
8. Click `Save workflow`.

The dashboard automatically calculates a `Priority` score from impact and
estimated weekly hours saved. Higher scores should be reviewed first.

## Field Guide

| Field | What to Enter | Example |
|---|---|---|
| Workflow name | Short name for the automation idea | Daily sales summary |
| Problem | Pain point or repeated manual work | Daily sales data takes too long to summarize manually |
| Current process | How the work is done now | Open spreadsheet, filter today, calculate total, write summary |
| Automation idea | What the tool should automate | Generate daily sales summary and prepare a LINE message |
| Next step | The next concrete action | Prepare sample Google Sheet data |
| Category | Type of solution | Data Dashboard |
| Status | Progress stage | Idea, Build, or Live |
| Impact | Business or workflow importance | High, Medium, or Low |
| Hours saved per week | Estimated manual time saved | 3 |

## Priority Scoring

Priority is calculated automatically:

```text
Priority = impact score + (hours saved per week * 2)
```

Impact scores:

| Impact | Score |
|---|---:|
| High | 30 |
| Medium | 20 |
| Low | 10 |

Example:

```text
Impact: High
Hours saved per week: 5
Priority: 30 + (5 * 2) = 40
```

## Data Storage

Data is saved in the browser with `localStorage`. It stays on the same browser
and device, but it can be lost if browser data is cleared. Use `Export CSV` to
download a backup or review the data in Excel or Google Sheets.

## Tech Stack

- HTML
- CSS
- JavaScript
- Canvas charts
- LocalStorage

## Project Structure

```text
project-02-ai-workflow-dashboard/
  index.html
  styles.css
  script.js
  README.md
```

## Preview

Open `index.html` in a browser.

## Live Site

https://kharawat.github.io/Project-02-ai-workflow-dashboard/
