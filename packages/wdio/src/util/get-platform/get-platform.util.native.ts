// eslint-disable-next-line @typescript-eslint/no-require-imports,node/no-missing-require,@typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment,node/no-extraneous-require
const { Platform: RNPlatform } = require('react-native');

// HINT: This is a hack
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const Platform = RNPlatform;
