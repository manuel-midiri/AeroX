export type CrewStatus = 'ACTIVE' | 'TRAINING' | 'RESERVE' | 'RETIRED';

export interface CrewMember {
  name: string;
  agency: string;
  status: CrewStatus;
  missions: number;
  last: string;
  role: string;
}
