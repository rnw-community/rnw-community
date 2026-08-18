import type { Component } from 'react';
import type { AnimatedRef } from 'react-native-reanimated';

type AttachableToAnyScrollableRef = (instance: never) => void;

/**
 * Animated scroll ref that attaches to any Reanimated-animated scrollable, whatever instance type its `ref` prop declares.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderscrollref
 */
export type CollapsibleHeaderScrollRef = AnimatedRef<Component> & AttachableToAnyScrollableRef;
