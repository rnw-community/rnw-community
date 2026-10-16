 
import { Config } from 'react-native-config';

/**
 * Reads an environment variable from `react-native-config` on native platforms and from `process.env.REACT_APP_<key>` on web.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/platform/readme.md#getenv
 */
export const getEnv = (key: string): string | undefined => Config[key];
