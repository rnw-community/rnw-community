import { getNestJSWebpackGenericConfig } from './get-nestjs-webpack-generic.config';

import type { Configuration } from 'webpack';
import type Webpack from 'webpack';

export const getNestJSWebpackProdConfig = (options: Configuration, _webpack: typeof Webpack): Configuration => ({
    ...getNestJSWebpackGenericConfig(options, { minify: true }),
});
