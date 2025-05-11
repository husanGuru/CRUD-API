import { v4 as uuidv4 } from "uuid";

export class User {
  username: string;
  age: number;
  hobbies: string[];
  id: string;

  constructor({
    username,
    age,
    hobbies,
  }: {
    username: string;
    age: number;
    hobbies: string[];
  }) {
    this.id = uuidv4();
    this.username = username;
    this.age = age;
    this.hobbies = hobbies;
  }
}
