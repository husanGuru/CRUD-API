import { User } from "./user";

import { validate, version } from "uuid";

type ReturnType = {
  status: number;
  message?: string | null;
  data?: User | User[] | null;
};

const users: User[] = [];

function uuidValidateV4(uuid: string) {
  return validate(uuid) && version(uuid) === 4;
}

export function getUsers(): ReturnType {
  return { data: users, status: 200 };
}

export function getUserById(id: string): ReturnType {
  if (!uuidValidateV4(id)) {
    return { status: 400, message: "Invalid id" };
  }
  const user = users.find((user) => user.id === id);
  return {
    data: user ?? null,
    status: user ? 200 : 404,
    message: user ? null : "User not found",
  };
}

export function addUser({
  username,
  age,
  hobbies,
}: {
  username: string;
  age: number;
  hobbies: string[];
}): ReturnType {
  const user = new User({ username, age, hobbies });
  users.push(user);
  return { data: user, status: 201 };
}

export function updateUser(
  id: string,
  {
    username,
    age,
    hobbies,
  }: {
    username?: string;
    age?: number;
    hobbies?: string[];
  }
): ReturnType {
  if (!uuidValidateV4(id)) {
    return { status: 400, message: "Invalid id" };
  }

  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return { status: 404, message: "user not found" };
  }
  users[userIndex] = {
    ...users[userIndex],
    username: username ?? users[userIndex].username,
    age: age ?? users[userIndex].age,
    hobbies: hobbies ?? users[userIndex].hobbies,
  };
  return { status: 200, data: users[userIndex] };
}

export function deleteUser(id: string): ReturnType {
  if (!uuidValidateV4(id)) {
    return { status: 400, message: "Invalid id" };
  }
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) {
    return { status: 404, message: "user not found" };
  }
  users.splice(userIndex, 1);
  return { status: 204, message: "deleted successfully" };
}
