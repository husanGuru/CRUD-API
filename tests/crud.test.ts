import request from "supertest";
import server from "../src/app";

describe("crud api", () => {
  afterAll(() => {
    server.close();
  });
  test("should get empty users array on GET api/users", async () => {
    const response = await request(server)
      .get("/api/users")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toEqual([]);
  });
  test("should create a user on POST api/users", async () => {
    const user = {
      username: "husan",
      age: 24,
      hobbies: ["football"],
    };
    const response = await request(server)
      .post("/api/users")
      .send(JSON.stringify(user))
      .expect("Content-Type", /json/)
      .expect(201);

    const { id, ...newUser } = response.body;
    expect(typeof id).toBe("string");
    expect(newUser).toEqual(user);
  });
  test("should get user by userId on GET api/users/{userId}", async () => {
    const user = {
      username: "husan",
      age: 24,
      hobbies: ["football"],
    };

    //create user
    const newUser = (
      await request(server)
        .post("/api/users")
        .send(JSON.stringify(user))
        .expect("Content-Type", /json/)
        .expect(201)
    ).body;

    //get user
    const getUser = (
      await request(server)
        .get(`/api/users/${newUser.id}`)
        .expect("Content-Type", /json/)
        .expect(200)
    ).body;

    expect(getUser).toEqual(newUser);
  });

  test("should update user by userId on GET api/users/{userId}", async () => {
    const user = {
      username: "husan",
      age: 24,
      hobbies: ["football"],
    };

    //create user
    const newUser = (
      await request(server)
        .post("/api/users")
        .send(JSON.stringify(user))
        .expect("Content-Type", /json/)
        .expect(201)
    ).body;

    //update user
    const updatedUser = (
      await request(server)
        .put(`/api/users/${newUser.id}`)
        .send(
          JSON.stringify({
            username: "updated username",
            age: 14,
            hobbies: ["chess"],
          })
        )
        .expect("Content-Type", /json/)
        .expect(200)
    ).body;

    //get user
    const getUser = (
      await request(server)
        .get(`/api/users/${newUser.id}`)
        .expect("Content-Type", /json/)
        .expect(200)
    ).body;

    expect(updatedUser.id).toBe(newUser.id);
    expect(getUser).toEqual(updatedUser);
  });

  test("should delete user by userId on DELETE api/users/{userId} and return 404 for deleted user on GET api/users/{userId}", async () => {
    const user = {
      username: "husan",
      age: 24,
      hobbies: ["football"],
    };

    //create user
    const newUser = (
      await request(server)
        .post("/api/users")
        .send(JSON.stringify(user))
        .expect("Content-Type", /json/)
        .expect(201)
    ).body;

    //delete user and expect success deletion status 204
    await request(server)
      .delete(`/api/users/${newUser.id}`)
      .expect("Content-Type", /json/)
      .expect(204);

    //try to get deleted user and expect 404 status
    await request(server)
      .get(`/api/users/${newUser.id}`)
      .expect("Content-Type", /json/)
      .expect(404);
  });


});
