export function apiOppsett(host: string): string {
  if (host.startsWith("localhost")) {
    return "http://localhost:3000";
  } else if (host.indexOf(".dev.") !== -1) {
    return "https://klage-oppgave-api.dev.nav.no";
  } else {
    return "https://klage-oppgave-api.nav.no";
  }
}
