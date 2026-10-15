import type { EdgeFadeBandRenderPropsInterface } from './edge-fade-band-render-props.interface';
import type { ReactNode } from 'react';

/**
 * Renders custom edge-fade band content inside the package's positioned, scroll-animated, inert band container.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefadebandrenderer
 */
export type EdgeFadeBandRenderer = (props: EdgeFadeBandRenderPropsInterface) => ReactNode;
