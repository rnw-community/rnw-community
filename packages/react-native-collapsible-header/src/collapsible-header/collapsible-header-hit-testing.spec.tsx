import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { ViewProps, ViewStyle } from 'react-native';

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;

type SubjectProps = Partial<Pick<CollapsibleHeaderProps, 'headerStyle' | 'persistentContent'>>;

const Subject = ({ headerStyle, persistentContent }: SubjectProps) => {
    const scrollY = useSharedValue(0);

    return (
        <CollapsibleHeader
            testID="header"
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            headerStyle={headerStyle}
            persistentContent={persistentContent}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const getShellProps = (): Pick<ViewProps, 'style'> =>
    screen.getByTestId('header-header', { includeHiddenElements: true }).props;
const getShellPointerEvents = (): ViewStyle['pointerEvents'] =>
    StyleSheet.flatten<ViewStyle>(getShellProps().style).pointerEvents;

describe('CollapsibleHeader shell hit testing', () => {
    it('leaves empty header space transparent so touches reach the content beneath', () => {
        expect.hasAssertions();
        render(<Subject />);

        expect(getShellPointerEvents()).toBe('box-none');
    });

    it('keeps header controls tappable through the transparent shell', () => {
        expect.hasAssertions();
        const onPress = jest.fn();
        render(
            <Subject
                persistentContent={
                    <Pressable testID="action" onPress={onPress}>
                        <Text>Action</Text>
                    </Pressable>
                }
            />
        );
        fireEvent.press(screen.getByTestId('action'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('lets a caller-supplied shell pointer events value win over the default', () => {
        expect.hasAssertions();
        render(<Subject headerStyle={{ pointerEvents: 'auto' }} />);

        expect(getShellPointerEvents()).toBe('auto');
    });
});
