export interface Launch {
  id: string;
  name: string;
  flight_number: number;
  date: string;
  rocket: string;
  success: boolean;
  details: string;
  patch: string | null;
  youtube: string;
  orbit: string;
}
