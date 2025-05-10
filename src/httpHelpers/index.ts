import { createHandler } from "./createHandler";

const httpHelpers = {
  get: createHandler("GET"),
  post: createHandler("POST"),
  put: createHandler("PUT"),
  delete: createHandler("DELETE"),
};

export default httpHelpers;
