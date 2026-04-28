export type RocketStatus = 'ACTIVE' | 'DEVELOPMENT' | 'RETIRED';

export interface Rocket {
  id: string;
  name: string;
  family: string;
  status: RocketStatus;
  first_flight: string;
  height_m: number;
  diameter_m: number;
  mass_kg: number;
  stages: number;
  boosters: number;
  thrust_sl_kn: number;
  payload_leo_kg: number;
  payload_gto_kg: number;
  cost_per_launch: number;
  success_rate: number;
  reusable: boolean;
  flights: number;
  engines: string;
  description: string;
}
