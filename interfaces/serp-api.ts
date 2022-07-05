interface Teams {
    name: string;
    thumbnail?: string;
}

interface SingleFixture {
    teams: Teams[];
    participants?: string;
    date: string;
    time: string;
    date_time?: Date;
    stage?: string;
    tournament?: string;
}

export type MultipleFixtures = Array<SingleFixture>