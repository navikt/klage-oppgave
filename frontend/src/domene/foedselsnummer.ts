export const fnrFormat = (fnr: string): string => {
  return fnr.substring(0, 6) + " " + fnr.substring(6);
};
