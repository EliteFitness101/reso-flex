export interface AssessmentResult {
  goal: string;
  recommendedTier: number;
}

export function runAssessment(
  goal: string
): AssessmentResult {
  switch (goal) {
    case "lose_weight":
      return {
        goal,
        recommendedTier: 3,
      };

    case "gain_curves":
      return {
        goal,
        recommendedTier: 4,
      };

    case "muscle":
      return {
        goal,
        recommendedTier: 6,
      };

    default:
      return {
        goal,
        recommendedTier: 2,
      };
  }
}
