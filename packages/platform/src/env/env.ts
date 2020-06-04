import Config from 'react-native-config';

export const getEnv = (key: string): string | undefined => Config[key];
