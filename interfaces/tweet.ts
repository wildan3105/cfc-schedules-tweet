type ReplySettings = "following" | "mentionedUsers";

export interface Content {
  text: string;
  reply_settings?: ReplySettings;
}
