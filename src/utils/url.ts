export function urlMatcher({
  url,
  path,
}: {
  url: string | undefined;
  path: string;
}) {
  const pathParam = path.split(":")[1];
  const pathUrl = path.split(":")[0];
  const urlParam = url?.replace(pathUrl, "");

  if (
    ((pathParam && url?.includes(pathUrl)) ||
      (!pathParam && url === pathUrl)) &&
    (!pathParam || urlParam)
  ) {
    return { isMatch: true, urlParam, pathParam };
  }

  return { isMatch: false, urlParam, pathParam };
}
