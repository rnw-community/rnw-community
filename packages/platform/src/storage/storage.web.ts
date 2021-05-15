// @ts-expect-error No TS declaration yet
import webStorage from 'redux-persist/lib/storage';

/** @deprecated Use @react-native-community/async-storage, it has web fallback support */
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const storage = webStorage;
