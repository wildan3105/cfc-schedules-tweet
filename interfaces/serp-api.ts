export interface SingleFixture {
  teams: Teams[];
  tournament: string;
  stadium: string;
  participants?: string;
  date?: string;
  time?: string;
  date_time?: Date;
  stage?: string;
  league?: string;
  video_highlights?: VideoHighlight[]
}

export interface GameSpotlight {
  teams: Teams[];
  stadium: string;
  league?: string;
  tournament?: string;
  date?: string;
  time?: string;
}

export interface SportsResults {
  title: string;
  rankings: string;
  thumbnail: string;
  games: SingleFixture[]
}

interface VideoHighlight {
  link?: string;
  thumbnail?: string;
  duration?: string;
}

interface Teams {
  name: string;
  thumbnail?: string;
}