interface Teams {
    name: string;
    thumbnail?: string;
}

export interface Schdule {
    date: string;
    time: string;
    teams: Teams;
    tourname?: string;
    stage?: string;
}