import { ActionsObservable, StateObservable } from "redux-observable";
import { TestScheduler } from "rxjs/testing";
import { marbles } from "rxjs-marbles/jest";
import { fjernToasterEpos, initierToaster, toasterFjern, visToasterEpos } from "./toaster";

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
          a: initierToaster({
            type: "feil",
            beskrivelse: "se opp, en feil",
          }),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const initState = {};
        const observableValues = {
          a: initState,
          s: {
            payload: {
              type: "feil",
              beskrivelse: "se opp, en feil",
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
          a: toasterFjern(),
        };
        const action$ = new ActionsObservable(hot("-a", inputValues));

        const initState = {
          type: "feil",
          beskrivelse: "se opp, en feil",
        };

        const observableValues = {
          a: initState,
          s: {
            payload: {
              type: "feil",
              beskrivelse: "",
            },
            type: "toaster/SATT",
          },
        };

        expectObservable(fjernToasterEpos(action$)).toBe("15001ms s", observableValues);
      });
    })
  );
});
