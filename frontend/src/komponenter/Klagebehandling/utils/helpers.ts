export const isNotUndefined = <T>(o: T | undefined): o is T => typeof o !== "undefined";

export const arrayEquals = <T>(a1: T[], a2: T[]): boolean =>
  a1 === a2 || (a1.length === a2.length && a1.every((e) => a2.includes(e)));
