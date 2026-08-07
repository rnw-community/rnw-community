import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
}

/**
 * Marks the expanded title layer of a compound collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeaderLargeTitle = ({ children }: Props): ReactNode => children;
