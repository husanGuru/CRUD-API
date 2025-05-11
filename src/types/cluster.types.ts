export type SendType = "add" | "getAll" | "getById" | "update" | "delete";

export interface Payload {
  username?: string;
  age?: number;
  hobbies?: string[];
  userId?: string;
}
