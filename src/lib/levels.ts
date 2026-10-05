export function computeWorkerLevel({
  hasVerifiedKyc,
  verifiedSkillsCount,
  verifiedCertificatesCount,
  completedTrainingsCount,
  totalJobs,
  ratingAvg,
  experienceYears,
}: {
  hasVerifiedKyc: boolean;
  verifiedSkillsCount: number;
  verifiedCertificatesCount: number;
  completedTrainingsCount: number;
  totalJobs: number;
  ratingAvg: number;
  experienceYears: number;
}): { level: number; levelTitle: string; completionPct: number } {
  let level = 1; // Registered

  if (hasVerifiedKyc && verifiedSkillsCount >= 1) {
    level = 2; // Verified
  }
  if (level >= 2 && verifiedCertificatesCount >= 1 && totalJobs >= 5) {
    level = 3; // Certified
  }
  if (level >= 3 && experienceYears >= 3 && totalJobs >= 25 && ratingAvg >= 4.5) {
    level = 4; // Advanced
  }
  if (level >= 4 && experienceYears >= 5 && totalJobs >= 100 && ratingAvg >= 4.8 && completedTrainingsCount >= 1) {
    level = 5; // Expert
  }

  const levelTitles: Record<number, string> = {
    1: 'Registered',
    2: 'Verified',
    3: 'Certified',
    4: 'Advanced',
    5: 'Expert',
  };

  let completion = 40;
  if (hasVerifiedKyc) completion += 20;
  if (verifiedSkillsCount > 0) completion += 15;
  if (verifiedCertificatesCount > 0) completion += 15;
  if (completedTrainingsCount > 0) completion += 10;

  return {
    level,
    levelTitle: levelTitles[level] || 'Registered',
    completionPct: Math.min(100, completion),
  };
}
