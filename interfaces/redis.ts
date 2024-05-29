export interface RedisFixture {
  participants?: string;
  tournament?: string;
  match_time?: Date;
  stadium?: string;
}

export interface RedisWithReminder extends RedisFixture {
  reminder_time: Date;
  hours_to_match: number;
}

export interface IPublishedMessage {
  hours_to_match: number;
  message: RedisFixture;
}
