module.exports = {
  preset: "ts-jest",
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },
  transform: {
    ".+\\.less$": "jest-transform-stub",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(nav-frontend-typografi-style|nav-frontend-alertstriper-style|nav-frontend-spinner-style|nav-frontend-etiketter-style|nav-frontend-knapper-style)/)",
  ],
  testEnvironment: "node",
  globals: {
    window: {
      location: {
        host: "http://localhost",
      },
    },
  },
};
