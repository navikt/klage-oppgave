export const formattedDate = (frist: number) => {
  const utime = new Date(frist).getTime();
  const ye = new Intl.DateTimeFormat("nb", { year: "numeric" }).format(utime);
  const mo = new Intl.DateTimeFormat("nb", { month: "2-digit" }).format(utime);
  const da = new Intl.DateTimeFormat("nb", { day: "2-digit" }).format(utime);
  return `${da}${mo}${ye}`;
};

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/; // 2020-10-29

export type ISODate = string;
export type prettyDate = string;

export function isoDateToPretty(isoDate: ISODate | null): prettyDate | null {
  if (isoDate === null || !isoDateRegex.test(isoDate)) {
    return null;
  }
  return isoDate.split("-").reverse().join(".");
}
