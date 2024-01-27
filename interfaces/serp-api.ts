interface Teams {
  name: string;
  thumbnail?: string;
}

export interface SingleFixture {
  teams: Teams[];
  participants?: string;
  date?: string;
  time?: string;
  date_time?: Date;
  stage?: string;
  tournament: string;
  stadium: string;
}