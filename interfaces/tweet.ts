type ReplySettings = "following" | "mentionedUsers";

export interface Content {
  text: string;
  reply_settings?: ReplySettings;
}

export interface ITweet {
  hours_to_match: number;
  message: {
    stadium: string;
    participants: string;
    match_time: Date;
    tournament: string;
  };
}
