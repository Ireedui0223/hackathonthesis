export interface AtRiskStudent {
  student_id: string;
  season_id: string;
  commission_id: string;
  total_score: number;
  result_status: "PASSED" | "FAILED";
  student_name: string;
  gpa_band: "LOW" | "MID" | "HIGH";
  topic_area: string;
  topic_title: string;
  final_pct: number;
  risk_score: number;
  risk_label: "HIGH_RISK" | "MEDIUM_RISK" | "LOW_RISK";
}

export interface CommissionSummary {
  season_id: string;
  commission_id: string;
  commission_name: string;
  student_count: number;
  avg_total: number;
  median_total: number;
  min_total: number;
  max_total: number;
  pass_rate: number;
}

export interface CriterionSummary {
  season_id: string;
  stage: string;
  criterion_name: string;
  avg_pct: number;
  median_pct: number;
  std_pct: number;
  count: number;
}

export interface TeacherStrictness {
  teacher_id: string;
  mean_deviation_pct: number;
  score_count: number;
  avg_given_pct: number;
  teacher_name: string;
  strictness_label: "STRICT" | "NEAR_AVERAGE" | "LENIENT";
  consistency_label: string;
}

export interface TopicAreaSummary {
  topic_area: string;
  student_count: number;
  avg_total: number;
  avg_final: number;
  pass_rate: number;
}

export interface StageProgress {
  student_id: string;
  season_id: string;
  total_score: number;
  result_status: "PASSED" | "FAILED";
  progress_archetype: string;
  student_name: string;
  gpa_band: string;
}

export interface GuestImpact {
  guest_id: string;
  guest_name: string;
  organization_name: string;
  avg_guest_minus_internal_pct: number;
  appearances: number;
  impact_label: string;
}

export interface ReviewerAlignment {
  student_id: string;
  season_id: string;
  conclusion_type: "APPROVE" | "APPROVE_WITH_MINOR_FIXES" | "MAJOR_FIXES_NEEDED" | "NOT_READY";
  reviewer_minus_final_pct: number;
}

export interface DisagreementCase {
  season_id: string;
  student_id: string;
  stage: string;
  commission_id: string;
  evaluator_count: number;
  range_pct_of_stage: number;
  student_name: string;
  topic_area: string;
}

export interface AnalyticsDataset {
  atRiskStudents: AtRiskStudent[];
  commissionSummary: CommissionSummary[];
  criterionSummary: CriterionSummary[];
  teacherStrictness: TeacherStrictness[];
  topicAreaSummary: TopicAreaSummary[];
  stageProgress: StageProgress[];
  guestImpact: GuestImpact[];
  reviewerAlignment: ReviewerAlignment[];
  disagreementCases: DisagreementCase[];
}
