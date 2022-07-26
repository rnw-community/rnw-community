// HINT: This is a hack
export let Platform = {
    OS: 'web',
};

try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports,node/no-missing-require,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment,node/no-extraneous-require
    const { Platform: RNPlatform } = require('react-native');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Platform = RNPlatform;
} catch (e) {}
