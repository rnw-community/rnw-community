/**
 * The webpack HMR `module` shape accepted by `handleNestJSWebpackHmr`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-webpack-swc/readme.md#nestjs-hmr
 */
export interface HmrModuleInterface {
    /** The webpack hot-module API, present only when the bundle runs with HMR enabled. */
    hot?: {
        accept: () => void;
        dispose: (callback: () => Promise<void>) => void;
    };
}
