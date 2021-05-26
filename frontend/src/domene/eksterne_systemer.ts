const gosysEnvironment = (hostname: string) => {
  if (hostname === "localhost") {
    return "http://localhost:3000";
  } else if (hostname.indexOf("dev.nav.no") !== -1) {
    return "https://gosys.nais.preprod.local";
  }
  return "https://gosys-nais.nais.adeo.no";
};

// TODO de tre nederste er trolig feil og må endres

const modiaEnvironment = (hostname: string) => {
  if (hostname === "localhost") {
    return "http://localhost:3000";
  } else if (hostname.indexOf("dev.nav.no") !== -1) {
    return "https://modapp.nais.preprod.local/modiapersonoversikt";
  }
  return "https://modapp-nais.nais.adeo.no/modiapersonoversikt";
};

const aInntektEnvironment = (hostname: string) => {
  if (hostname === "localhost") {
    return "http://localhost:3000";
  } else if (hostname.indexOf("dev.nav.no") !== -1) {
    return "https://modapp.nais.preprod.local/modiapersonoversikt";
  }
  return "https://modapp-nais.nais.adeo.no/modiapersonoversikt";
};

const vedtaksEnvironment = (hostname: string) => {
  if (hostname === "localhost") {
    return "http://localhost:3000";
  } else if (hostname.indexOf("dev.nav.no") !== -1) {
    return "https://modapp.nais.preprod.local/modiapersonoversikt";
  }
  return "https://modapp-nais.nais.adeo.no/modiapersonoversikt";
};

export { gosysEnvironment, modiaEnvironment, vedtaksEnvironment, aInntektEnvironment };
