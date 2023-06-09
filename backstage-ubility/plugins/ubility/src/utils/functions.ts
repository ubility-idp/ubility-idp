export function resolveJsonPath(obj: any, path: string): any {
  try {
    const pathSegments = path.split('.');
    return pathSegments.reduce((acc: any, key: string) => {
      return acc[key];
    }, obj);
  } catch (error) {
    return undefined;
  }
}
