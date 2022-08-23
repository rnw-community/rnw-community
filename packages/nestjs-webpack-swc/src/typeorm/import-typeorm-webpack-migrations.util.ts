/* eslint-disable @typescript-eslint/ban-types */
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
