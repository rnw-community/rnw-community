/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/**
 * Collects the migration classes exported by every file of a webpack `require.context`, in filename order, for the TypeORM `migrations` option.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-webpack-swc/readme.md#typeorm-migrations
 */
export const importTypeormWebpackMigrations = (requireContext: __WebpackModuleApi.RequireContext): Function[] =>
    requireContext
        .keys()
        .sort()
        .map(filename =>
            Object.entries(requireContext(filename) as Record<string, Function>)
                .filter(([, exported]) => typeof exported === 'function')
                .reduce<Function[]>((result, [, exported]) => [...result, exported], [])
        )
        .flat();
