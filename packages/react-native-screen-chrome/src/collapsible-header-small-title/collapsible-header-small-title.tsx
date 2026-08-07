import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
}

/**
 * Marks the collapsed title layer of a compound collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeaderSmallTitle = ({ children }: Props): ReactNode => children;
