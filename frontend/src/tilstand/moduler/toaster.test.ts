import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import {
  toasterSlice,
  skjulToasterEpos,
  toasterSett,
  toasterSkjul,
  visToasterEpos,
  toasterInitialState,
  toasterSatt,
} from "./toaster";
import megTilstand, { hentetHandling } from "./meg";
import { AlertStripeType } from "nav-frontend-alertstriper";

describe("Oppgave epos", () => {
  let ts: TestScheduler;
  beforeEach(() => {
    ts = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  afterEach(() => {
    ts.flush();
  });

  test(
    "+++ VIS TOASTER MED FEILMELDING",
    marbles(() => {
      ts.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
        const inputValues = {
          a: toasterSett({
            display: true,
            type: "feil",
            feilmelding: "se opp, en feil",
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const initState = {};
        const observableValues = {
          a: initState,
          s: {
            payload: {
              display: true,
              type: "feil",
              feilmelding: "se opp, en feil",
            },
            type: "toaster/SATT",
          },
        };

        const state$ = new StateObservable(hot("-a", observableValues), initState);
        expectObservable(visToasterEpos(action$, state$)).toBe("-s", observableValues);
      });
    })
  );

  test(
    "+++ SKJUL TOASTER",
    marbles(() => {
      ts.run(({ hot, expectObservable }) => {
        const inputValues = {
          a: toasterSkjul(),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const initState = {
          display: true,
          type: "feil",
          feilmelding: "se opp, en feil",
        };

        const observableValues = {
          a: initState,
          s: {
            payload: {
              display: false,
              type: "feil",
              feilmelding: toasterInitialState.feilmelding,
            },
            type: "toaster/SATT",
          },
        };

        expectObservable(skjulToasterEpos(action$)).toBe("15001ms s", observableValues);
      });
    })
  );
});
