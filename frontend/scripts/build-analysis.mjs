import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(here, "..", "..", "analysis");
const outFile = join(here, "..", "data", "analysis.json");

function parseCsv(content) {
  const text = content.replace(/^﻿/, "");
  const rows = [];
  let field = "";
  let record = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      record.push(field);
      rows.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    rows.push(record);
  }
  return rows.filter((row) => row.length > 1 || (row.length === 1 && row[0] !== ""));
}

function coerce(value) {
  if (value === "" || value === undefined) return null;
  if (value === "True") return true;
  if (value === "False") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function toObjects(rows) {
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((row) => {
    const item = {};
    header.forEach((key, index) => {
      item[key] = coerce(row[index]);
    });
    return item;
  });
}

function camelCase(name) {
  return name.replace(/\.csv$/, "").replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

const projection = {
  atRiskStudents: ["student_id", "season_id", "commission_id", "total_score", "result_status", "student_name", "gpa_band", "topic_area", "topic_title", "final_pct", "risk_score", "risk_label"],
  commissionSummary: ["season_id", "commission_id", "commission_name", "student_count", "avg_total", "median_total", "min_total", "max_total", "pass_rate"],
  criterionSummary: ["season_id", "stage", "criterion_name", "avg_pct", "median_pct", "std_pct", "count"],
  teacherStrictness: ["teacher_id", "mean_deviation_pct", "score_count", "avg_given_pct", "teacher_name", "strictness_label", "consistency_label"],
  topicAreaSummary: ["topic_area", "student_count", "avg_total", "avg_final", "pass_rate"],
  stageProgress: ["student_id", "season_id", "total_score", "result_status", "progress_archetype", "student_name", "gpa_band"],
  guestImpact: ["guest_id", "guest_name", "organization_name", "avg_guest_minus_internal_pct", "appearances", "impact_label"],
  reviewerAlignment: ["student_id", "season_id", "conclusion_type", "reviewer_minus_final_pct"],
  disagreementCases: ["season_id", "student_id", "stage", "commission_id", "evaluator_count", "range_pct_of_stage", "student_name", "topic_area"],
};

const dataset = {};
for (const file of readdirSync(sourceDir)) {
  if (!file.endsWith(".csv")) continue;
  const key = camelCase(file);
  const fields = projection[key];
  if (!fields) continue;
  const rows = toObjects(parseCsv(readFileSync(join(sourceDir, file), "utf8")));
  dataset[key] = rows.map((row) => Object.fromEntries(fields.map((field) => [field, row[field] ?? null])));
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(dataset), "utf8");

const counts = Object.entries(dataset)
  .map(([key, value]) => `${key}: ${value.length}`)
  .join(", ");
console.log(`Wrote ${outFile}`);
console.log(counts);
