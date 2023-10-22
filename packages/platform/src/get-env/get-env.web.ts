export const getEnv = (key: string): string | undefined => process.env[`REACT_APP_${key}`];
