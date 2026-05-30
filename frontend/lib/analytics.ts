import type {
  AnalyticsDataset,
  AtRiskStudent,
  CriterionSummary,
  ReviewerAlignment,
  StageProgress,
  TeacherStrictness,
} from "@/types/analysis";

export const SEASON_LABELS: Record<string, string> = {
  S2025_WINTER: "2025 Өвөл",
  S2026_SPRING: "2026 Хавар",
};

export const RISK_LABELS: Record<string, string> = {
  HIGH_RISK: "Өндөр эрсдэл",
  MEDIUM_RISK: "Дунд эрсдэл",
  LOW_RISK: "Бага эрсдэл",
};

export const ARCHETYPE_LABELS: Record<string, string> = {
  NORMAL_TRAJECTORY: "Хэвийн явц",
  STEADY_IMPROVER: "Тогтмол ахицтай",
  RECOVERED_AFTER_WEAK_START: "Сул эхэлж сэргэсэн",
  PERSISTENTLY_AT_RISK: "Байнга эрсдэлтэй",
  CONSISTENT_HIGH_PERFORMER: "Тогтвортой өндөр",
};

export const CONCLUSION_LABELS: Record<string, string> = {
  APPROVE: "Батлав",
  APPROVE_WITH_MINOR_FIXES: "Бага засвартай",
  MAJOR_FIXES_NEEDED: "Их засвар хэрэгтэй",
  NOT_READY: "Бэлэн бус",
};

export const CRITERION_LABELS: Record<string, string> = {
  Speech: "Илтгэх ур чадвар",
  Report: "Тайлан",
  "Topic understanding": "Сэдвийн ойлголт",
  "Question response": "Асуултын хариулт",
  "Uniqueness/freshness": "Шинэлэг байдал",
  "Presentation and Q&A": "Илтгэл ба асуулт",
  "Progress against thesis plan": "Төлөвлөгөөний биелэлт",
  "Work done since last defense": "Хийгдсэн ажил",
};

export const GPA_LABELS: Record<string, string> = {
  LOW: "Бага",
  MID: "Дунд",
  HIGH: "Өндөр",
};

const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

export function filterBySeason(data: AnalyticsDataset, season: string): AnalyticsDataset {
  if (season === "ALL") return data;
  const bySeason = <T extends { season_id: string }>(rows: T[]) => rows.filter((row) => row.season_id === season);
  return {
    ...data,
    atRiskStudents: bySeason(data.atRiskStudents),
    commissionSummary: bySeason(data.commissionSummary),
    criterionSummary: bySeason(data.criterionSummary),
    stageProgress: bySeason(data.stageProgress),
    reviewerAlignment: bySeason(data.reviewerAlignment),
    disagreementCases: bySeason(data.disagreementCases),
  };
}

export function buildKpis(students: AtRiskStudent[], commissionCount: number) {
  const total = students.length;
  const passed = students.filter((student) => student.result_status === "PASSED").length;
  const highRisk = students.filter((student) => student.risk_label === "HIGH_RISK").length;
  return {
    total,
    avgScore: round(mean(students.map((student) => student.total_score))),
    passRate: round(total ? (passed / total) * 100 : 0),
    commissions: commissionCount,
    highRisk,
  };
}

const SCORE_BINS = [
  { label: "<60", min: 0, max: 60 },
  { label: "60–65", min: 60, max: 65 },
  { label: "65–70", min: 65, max: 70 },
  { label: "70–75", min: 70, max: 75 },
  { label: "75–80", min: 75, max: 80 },
  { label: "80–85", min: 80, max: 85 },
  { label: "85–90", min: 85, max: 90 },
  { label: "90+", min: 90, max: 1000 },
];

export function scoreHistogram(students: AtRiskStudent[]) {
  return SCORE_BINS.map((bin) => ({
    label: bin.label,
    count: students.filter((student) => student.total_score >= bin.min && student.total_score < bin.max).length,
  }));
}

export function archetypeDistribution(rows: StageProgress[]) {
  const order = Object.keys(ARCHETYPE_LABELS);
  return order
    .map((key) => ({
      key,
      label: ARCHETYPE_LABELS[key],
      count: rows.filter((row) => row.progress_archetype === key).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function teacherDiverging(rows: TeacherStrictness[], perSide = 7) {
  const sorted = [...rows].sort((a, b) => a.mean_deviation_pct - b.mean_deviation_pct);
  const strict = sorted.slice(0, perSide);
  const lenient = sorted.slice(-perSide);
  const combined = [...strict, ...lenient.reverse()].filter(
    (row, index, list) => list.findIndex((item) => item.teacher_id === row.teacher_id) === index,
  );
  const maxAbs = Math.max(...combined.map((row) => Math.abs(row.mean_deviation_pct)), 1);
  return { rows: combined.sort((a, b) => a.mean_deviation_pct - b.mean_deviation_pct), maxAbs };
}

export function criterionPerformance(rows: CriterionSummary[]) {
  const grouped = new Map<string, { weighted: number; count: number }>();
  for (const row of rows) {
    const current = grouped.get(row.criterion_name) ?? { weighted: 0, count: 0 };
    current.weighted += row.avg_pct * row.count;
    current.count += row.count;
    grouped.set(row.criterion_name, current);
  }
  return [...grouped.entries()]
    .map(([name, value]) => ({
      name,
      label: CRITERION_LABELS[name] ?? name,
      avg: round(value.count ? value.weighted / value.count : 0),
    }))
    .sort((a, b) => a.avg - b.avg);
}

export function reviewerConclusions(rows: ReviewerAlignment[]) {
  const order = Object.keys(CONCLUSION_LABELS);
  const total = rows.length || 1;
  return order
    .map((key) => {
      const count = rows.filter((row) => row.conclusion_type === key).length;
      return { key, label: CONCLUSION_LABELS[key], count, share: round((count / total) * 100) };
    })
    .filter((item) => item.count > 0);
}

export function topAtRisk(students: AtRiskStudent[], limit = 10) {
  return [...students]
    .filter((student) => student.risk_label !== "LOW_RISK")
    .sort((a, b) => b.risk_score - a.risk_score || a.total_score - b.total_score)
    .slice(0, limit);
}
