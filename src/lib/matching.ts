import prisma from './prisma';

export interface MatchingWeights {
  skillMatch: number;      // default: 25
  certification: number;   // default: 20
  proximity: number;       // default: 20
  availability: number;    // default: 15
  rating: number;          // default: 10
  experience: number;      // default: 10
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  skillMatch: 25,
  certification: 20,
  proximity: 20,
  availability: 15,
  rating: 10,
  experience: 10,
};

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface WorkerMatchResult {
  workerId: string;
  fullName: string;
  level: number;
  levelTitle: string;
  ratingAvg: number;
  ratingCount: number;
  totalJobs: number;
  distanceKm: number;
  approximateArea: string;
  isAvailable: boolean;
  isEmergencyAvailable: boolean;
  hasVerifiedSkill: boolean;
  hasCertification: boolean;
  score: number;
  explanation: string;
  badges: string[];
}

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Registered',
  2: 'Verified',
  3: 'Certified',
  4: 'Advanced',
  5: 'Expert',
};

export async function rankWorkersForService({
  serviceId,
  customerLat,
  customerLng,
  isEmergency = false,
  weights = DEFAULT_WEIGHTS,
}: {
  serviceId: string;
  customerLat: number;
  customerLng: number;
  isEmergency?: boolean;
  weights?: MatchingWeights;
}): Promise<WorkerMatchResult[]> {
  // Find active workers with active worker subscriptions and verified status
  const workers = await prisma.worker.findMany({
    where: {
      user: {
        status: 'ACTIVE',
      },
      kycStatus: 'VERIFIED',
      isOffline: false,
      ...(isEmergency ? { isEmergencyAvailable: true } : {}),
    },
    include: {
      skills: {
        where: { serviceId },
      },
      certifications: {
        where: { status: 'VERIFIED' },
      },
      subscriptions: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  const ranked: WorkerMatchResult[] = [];

  for (const worker of workers) {
    // Distance
    const distanceKm = calculateDistanceKm(
      customerLat,
      customerLng,
      worker.latitude,
      worker.longitude
    );

    // Skill match
    const hasSkill = worker.skills.length > 0;
    const hasVerifiedSkill = hasSkill && worker.skills[0].isVerified;
    const hasCertification = worker.certifications.length > 0;

    // Proximity score (0 to 1)
    let proximityScore = 0;
    if (distanceKm <= 3) proximityScore = 1.0;
    else if (distanceKm <= 7) proximityScore = 0.8;
    else if (distanceKm <= 12) proximityScore = 0.6;
    else if (distanceKm <= 20) proximityScore = 0.4;
    else proximityScore = 0.2;

    // Availability score (0 to 1)
    const availabilityScore = worker.isAvailable && !worker.isBusy ? 1.0 : 0.4;

    // Rating score (0 to 1)
    const ratingScore = Math.min(1.0, worker.ratingAvg / 5.0);

    // Experience & jobs score (0 to 1)
    const expScore = Math.min(1.0, (worker.experienceYears * 0.05) + (worker.totalJobsCompleted * 0.005));

    // Weighted sum
    const totalScore =
      (hasVerifiedSkill ? 1.0 : hasSkill ? 0.6 : 0.2) * weights.skillMatch +
      (hasCertification ? 1.0 : 0.3) * weights.certification +
      proximityScore * weights.proximity +
      availabilityScore * weights.availability +
      ratingScore * weights.rating +
      expScore * weights.experience +
      (isEmergency && worker.isEmergencyAvailable ? 15 : 0);

    const levelTitle = LEVEL_NAMES[worker.currentLevel] || 'Verified';

    // Build plain-language explanation
    const reasons: string[] = [];
    if (hasCertification) reasons.push('government/NSDC certified');
    if (distanceKm <= 3.5) reasons.push(`only ${distanceKm} km away`);
    if (worker.isAvailable && !worker.isBusy) reasons.push('available immediately');
    if (worker.totalJobsCompleted > 50) reasons.push(`completed ${worker.totalJobsCompleted} jobs`);
    if (worker.ratingAvg >= 4.7) reasons.push(`${worker.ratingAvg}★ rated by neighbors`);

    const explanation = `Recommended because this worker is ${reasons.slice(0, 4).join(', ')}.`;

    const badges: string[] = ['Cooperative Member'];
    if (worker.currentLevel >= 4) badges.push(`Level ${worker.currentLevel} ${levelTitle}`);
    if (hasCertification) badges.push('Certified Artisan');
    if (worker.ratingAvg >= 4.8) badges.push('Top Rated');
    if (isEmergency && worker.isEmergencyAvailable) badges.push('24/7 Rapid Response');

    ranked.push({
      workerId: worker.id,
      fullName: worker.fullName,
      level: worker.currentLevel,
      levelTitle,
      ratingAvg: worker.ratingAvg,
      ratingCount: worker.ratingCount,
      totalJobs: worker.totalJobsCompleted,
      distanceKm,
      approximateArea: worker.areasServed.split(',')[0].trim() || 'Nearby Area',
      isAvailable: worker.isAvailable && !worker.isBusy,
      isEmergencyAvailable: worker.isEmergencyAvailable,
      hasVerifiedSkill,
      hasCertification,
      score: Math.round(totalScore * 10) / 10,
      explanation,
      badges,
    });
  }

  // Sort descending by score
  return ranked.sort((a, b) => b.score - a.score);
}
