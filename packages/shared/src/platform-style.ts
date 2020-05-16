import { isAndroid, isIOS, isMobile, isWeb } from './platform';

const platformStyles = <T extends object>(isPlatform: boolean, style: T): T | {} => (isPlatform ? style : {});

export const webStyles = <T extends object>(style: T) => platformStyles<T>(isWeb, style);
export const mobileStyles = <T extends object>(style: T) => platformStyles<T>(isMobile, style);
export const iosStyles = <T extends object>(style: T) => platformStyles<T>(isIOS, style);
export const androidStyles = <T extends object>(style: T) => platformStyles<T>(isAndroid, style);
