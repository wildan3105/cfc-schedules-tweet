export interface EmailRequest {
    Recipients: EmailRecipients;
    Content: EmailContent
}

export interface EmailOptions {
    TimeOffSet?: number;
    PoolName?: string;
    ChannelName?: string;
    Encoding?: Encoding;
    TrackOpens?: boolean;
    TrackClicks?: boolean;
}

interface EmailRecipients {
    To: string[];
    CC?: string[];
    BCC?: string[];
}

interface EmailContent {
    From: string;
    Body: BodyObjects[];
    Merge?: MergeFields;
    Attachments?: Attachments[];
    Headers?: EmailHeaders;
    Postback?: string;
    EnvelopeFrom?: string;
    ReplyTo?: string;
    Subject?: string;
    TemplateName?: string;
    AttachFiles?: string[];
    Utm?: Utm;
}

interface BodyObjects {
    ContentType: ContentType;
    Content?: string;
    Charset?: string;
}

interface MergeFields {
    [key: string]: string;
}

interface Attachments {
    BinaryContent: string; // base-64 encoded string
    Name: string;
    ContentType?: string;
    Size?: number; // in bytes
}

interface EmailHeaders {
    [key: string]: string;
}

interface Utm {
    Source?: string;
    Medium?: string;
    Campaign?: string;
    Content?: string;
}

type ContentType = "HTML"
    | "PlainText"
    | "AMP"
    | "CSS"

type Encoding = "UserProvided" 
    | "None" 
    | "Raw7bit" 
    | "Raw8bit" 
    | "QuotedPrintable"
    | "Base64"
    | "Uue"