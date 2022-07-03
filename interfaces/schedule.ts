interface Teams {
    name: string;
    thumbnail?: string;
}

export interface Schedule {
    teams: Teams[];
    competition: string;
    date: string;
    time: string;
    stage?: string;
}