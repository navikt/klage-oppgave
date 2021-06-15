export const formattedDate = (frist: any) => {
  const utime = new Date(frist).getTime();
  if (!isNaN(utime)) {
    const ye = new Intl.DateTimeFormat("nb", { year: "numeric" }).format(utime);
    const mo = new Intl.DateTimeFormat("nb", { month: "2-digit" }).format(utime);
    const da = new Intl.DateTimeFormat("nb", { day: "2-digit" }).format(utime);
    let res = `${da}${mo}${ye}`;
    if (res === "01.01.1970") return "mangler";
    else return res;
  }
  return "mangler";
};

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/; // 2020-10-29
const isoTimeRegex = /^\d{2}:\d{2}:\d{2}\.\d+$/; // 14:25:19.734593
const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+$/; // 2020-10-29T14:25:19.734593

export type ISODate = string;
export type ISODateTime = string;
export type ISOTime = string;
export type prettyDate = string;
export type prettyDateTime = string;
export type prettyTime = string;

export function isoDateTimeToPretty(isoDateTime: ISODateTime | null): prettyDateTime | null {
  if (isoDateTime === null || !isoDateTimeRegex.test(isoDateTime)) {
    return null;
  }
  const [isoDate, isoTime] = isoDateTime.split("T");
  const prettyDate = isoDateToPretty(isoDate);
  const prettyTime = isoTimeToPretty(isoTime);
  return `${prettyDate} ${prettyTime}`;
}

export function isoTimeToPretty(isoTime: ISOTime | null): prettyTime | null {
  if (isoTime === null || !isoTimeRegex.test(isoTime)) {
    return null;
  }
  return isoTime.split(".")[0];
}

export function isoDateToPretty(isoDate: ISODate | null): prettyDate | null {
  if (isoDate === null || !isoDateRegex.test(isoDate)) {
    return null;
  }
  return isoDate.split("-").reverse().join(".");
}

const prettyRegex = /^\d{2}.\d{2}.\d{4}$/;

export function prettyDateToISO(prettyDate: prettyDate | null): ISODate | null {
  if (prettyDate === null || !prettyRegex.test(prettyDate)) {
    return null;
  }
  return prettyDate.split(".").reverse().join("-");
}
