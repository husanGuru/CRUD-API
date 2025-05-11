
export type ExtractPathParam<Path extends string> =
  Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParam<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
    ? Param
    : never;
