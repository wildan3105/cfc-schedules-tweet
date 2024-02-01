interface Teams {
  name: string;
  thumbnail?: string;
}

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
}

export interface GameSpotlight {
  teams: Teams[];
  stadium: string;
  league?: string;
  tournament?: string;
  date?: string;
  time?: string;
}