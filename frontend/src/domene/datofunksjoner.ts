export const formattedDate = (frist: number) => {
  const utime = new Date(frist).getTime();
  if (!isNaN(utime)) {
    const ye = new Intl.DateTimeFormat("nb", { year: "numeric" }).format(utime);
    const mo = new Intl.DateTimeFormat("nb", { month: "2-digit" }).format(utime);
    const da = new Intl.DateTimeFormat("nb", { day: "2-digit" }).format(utime);
    return `${da}${mo}${ye}`;
  } else return "mangler";
};
