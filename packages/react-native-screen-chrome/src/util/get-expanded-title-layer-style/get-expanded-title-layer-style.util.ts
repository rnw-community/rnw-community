import { Children, isValidElement } from 'react';

import { SCREEN_CHROME_HEADER_LAYOUT_METRICS } from '../../constant/screen-chrome-header-layout-metrics.constant';

import type { ExpandedTitleAlignment } from '../../type/expanded-title-alignment.type';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

const { rowPadding, slotSize, titleInset } = SCREEN_CHROME_HEADER_LAYOUT_METRICS;

const hasSlotContent = (slot: ReactNode): boolean =>
    isValidElement<{ readonly children?: ReactNode }>(slot) && Children.count(slot.props.children) > 0;

const getStartAlignedInset = (slot: ReactNode): number => rowPadding + (hasSlotContent(slot) ? slotSize : 0);

export const getExpandedTitleLayerStyle = (
    alignment: ExpandedTitleAlignment,
    leading: ReactNode,
    trailing: ReactNode
): ViewStyle =>
    alignment === 'start'
        ? {
              alignItems: 'stretch',
              paddingStart: getStartAlignedInset(leading),
              paddingEnd: getStartAlignedInset(trailing),
          }
        : { alignItems: 'center', paddingHorizontal: titleInset };
