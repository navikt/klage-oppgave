function isDevLocation() {
  return (
    window.location.hostname.indexOf("dev.nav.no") !== -1 ||
    window.location.hostname.indexOf("localhost") !== -1
  );
}
export default isDevLocation;
