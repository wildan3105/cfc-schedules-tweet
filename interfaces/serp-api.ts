export interface APIResponse {
  search_metadata: searchMetadata,
  search_parameters: searchParameters,
  search_information: searchInformation,
  sports_results: SportsResults
}

export interface SingleFixture {
  teams?: Teams[];
  tournament?: string;
  stadium?: string;
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
  stage?: string;
  date?: string;
  time?: string;
}

export interface SportsResults {
  title: string;
  rankings: string;
  thumbnail: string;
  games: SingleFixture[]
  game_spotlight?: GameSpotlight
}

interface searchMetadata {
  id: string;
  status: string;
  json_endpoint: string;
  created_at: string;
  processed_at: string;
  google_url: string;
  raw_html_file: string;
  total_time_taken: number;
}

interface searchParameters {
  engine: string;
  q: string;
  location_requested: string;
  location_used: string;
  google_domain: string;
  device: string;
}

interface searchInformation {
  query_displayed: string;
  total_result: number;
  time_taken_displayed: number;
  organic_results_state: string;
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