
# CRUD API

RS school nodejs assignment


## Run Locally

Clone the project

```bash
  git clone --branch dev --single-branch https://github.com/husanGuru/CRUD-API
```

Go to the project directory

```bash
  cd CRUD-API
```

Install dependencies

```bash
  npm install
```

Start the dev server (watches file changes)

```bash
  npm run start:dev
```

Start the prod server (with ts build)

```bash
  npm run start:prod
```

Just to build ts project (generate js)

```bash
  npm run build
```
## Running Tests

** tests are run using supertest package, so there is no need to run the app in parallel

To run tests, run the following command

```bash
  npm run test
```

To run tests with coverage report, run the following command

```bash
  npm run test:coverage
```


## API Reference

#### Get all users

```http
  GET /api/users
```

#### Get user by userId

```http
  GET /api/users/${userId}
```

| Parameter | Type     | Description                                        |
| :-------- | :------- | :--------------------------------------------------|
| `userId`  | `string` | **Required**. Id of user (should be valid v4 uuid) |

#### Create new user

```http
  POST /api/users
```

| Body      | Type      | Description                    |
| :-------- | :---------| :------------------------------|
| `username`| `string`  | **Required**                   |
| `age`     | `number`  | **Required**.                  |
| `hobbies` | `string[]`| **Required**. Array of strings |

#### Update user

```http
  PUT /api/users/${userId}
```
| Parameter | Type     | Description                                        |
| :-------- | :------- | :--------------------------------------------------|
| `userId`  | `string` | **Required**. Id of user (should be valid v4 uuid) |

| Body      | Type      | Description       |
| :-------- | :---------| :-----------------|
| `username`| `string`  |                   |
| `age`     | `number`  |                   |
| `hobbies` | `string[]`|  Array of strings |

#### Delete user

```http
  DELETE /api/users/${userId}
```
| Parameter | Type     | Description                                        |
| :-------- | :------- | :--------------------------------------------------|
| `userId`  | `string` | **Required**. Id of user (should be valid v4 uuid) |

