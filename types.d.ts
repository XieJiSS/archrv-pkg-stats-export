interface TextEntity {
  type: string;
  text: string;
}

interface Message {
  id: number;
  type: string;
  date: string;
  date_unixtime: string;
  from: string;
  from_id: string;
  text: (TextEntity | string)[];
  text_entities: TextEntity[];
}

interface ChatHistoryJSON {
  name: string;
  type: string;
  id: number;
  messages: Message[];
}
