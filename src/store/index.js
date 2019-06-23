import { createStore, combineReducers } from "redux";
import { mapValues } from "lodash";
import querystring from "querystring";

import app from "./app";
import filter from "./filter";
import { fasterGetDefinitions } from "src/lib/definitions";

import definitions, {
  setBulkDefinitions,
  definitionsStatus,
  definitionsError,
  SET_BULK_DEFINITIONS
} from "./definitions";

const rootReducer = combineReducers({
  app,
  definitions,
  filter
});

function sanitiseDefintionsState(defintionsState) {
  if (!defintionsState) {
    return defintionsState;
  }
  return mapValues(
    defintionsState,
    definitions =>
      `[${Object.keys(definitions || {}).length} definitions hidden]`
  );
}

const store = (window.__store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__({
      actionsBlacklist: [SET_BULK_DEFINITIONS],
      stateSanitizer: state => ({
        ...state,
        definitions: sanitiseDefintionsState(state.definitions)
      })
    })
));

const qs = querystring.parse(window.location.search.substr(1));
const languages = [
  'de',
  'en',
  'es',
  'es-mx',
  'fr',
  'it',
  'ja',
  'ko',
  'pl',
  'pt-br',
  'ru',
  'zh-chs',
  'zh-cht'
];
const LANG_CODE = languages.includes(qs.lang) ? qs.lang : "en";

store.subscribe(() => {
  window.__state = store.getState();
  window.__definitions = window.__state.definitions;
});

fasterGetDefinitions(
  LANG_CODE,
  null,
  data => {
    store.dispatch(definitionsStatus(data));
  },
  (err, data) => {
    if (err) {
      console.error("Error loading definitions:", err);
      store.dispatch(definitionsError(err));
      return;
    }

    if (data && data.definitions) {
      store.dispatch(definitionsStatus({ status: null }));
      store.dispatch(setBulkDefinitions(data.definitions));
    }
  }
);

export default store;
