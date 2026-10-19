import type MaskedViewModule from '@react-native-masked-view/masked-view';
import type * as ExpoBlurModule from 'expo-blur';
import type * as ExpoLinearGradientModule from 'expo-linear-gradient';

const requireExpoBlur = (): typeof ExpoBlurModule | undefined => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('expo-blur') as typeof ExpoBlurModule;
    } catch {
        return void 0;
    }
};

const requireExpoLinearGradient = (): typeof ExpoLinearGradientModule | undefined => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('expo-linear-gradient') as typeof ExpoLinearGradientModule;
    } catch {
        return void 0;
    }
};

const requireMaskedView = (): { readonly default: typeof MaskedViewModule } | undefined => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('@react-native-masked-view/masked-view') as { readonly default: typeof MaskedViewModule };
    } catch {
        return void 0;
    }
};

export const edgeFadeNativeModules = {
    BlurView: requireExpoBlur()?.BlurView,
    LinearGradient: requireExpoLinearGradient()?.LinearGradient,
    MaskedView: requireMaskedView()?.default,
};
