import type { ComponentType, ReactElement } from 'react';
import type { ViewProps } from 'react-native';

interface MaskedViewProps extends ViewProps {
    readonly maskElement: ReactElement;
    readonly androidRenderingMode?: 'software' | 'hardware';
}

declare const MaskedView: ComponentType<MaskedViewProps>;

export default MaskedView;
