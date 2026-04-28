import type { Launch } from './launch';
import type { Upcoming } from './upcoming';
import type { Rocket } from './rocket';
import type { Pad } from './pad';
import type { CrewMember } from './crew';
import type { Starlink } from './starlink';

export interface Dataset {
  live: boolean;
  upcoming: Upcoming;
  past: readonly Launch[];
  rockets: readonly Rocket[];
  pads: readonly Pad[];
  crew: readonly CrewMember[];
  starlink: Starlink;
}
