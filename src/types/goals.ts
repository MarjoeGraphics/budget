export type GoalType = 'someday' | 'monthly' | 'deadline' | 'reserve';

export interface BaseGoal {
  id: string;
  type: GoalType;
  title: string;
  current: number;
  target: number;
  icon?: string;
  color?: string;
  imageUrl?: string;
}

export interface SomedayGoal extends BaseGoal {
  type: 'someday';
}

export interface MonthlyGoal extends BaseGoal {
  type: 'monthly';
  monthlyAllocation: number;
}

export interface DeadlineGoal extends BaseGoal {
  type: 'deadline';
  monthsRemaining: number;
}

export interface ReserveGoal extends BaseGoal {
  type: 'reserve';
  floor: number;
}

export type Goal = SomedayGoal | MonthlyGoal | DeadlineGoal | ReserveGoal;
