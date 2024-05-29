export interface RedisFixture {
  participants?: string;
  tournament?: string;
  date_time?: Date;
  stadium?: string;
}

export interface RedisWithReminder extends RedisFixture {
  reminder_time: Date;
}

export interface IPublishedMessage {
  hours_to_match: number;
  message: RedisFixture;
}
