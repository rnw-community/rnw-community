import '@testing-library/jest-native/extend-expect';
import { fireEvent, render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import React from 'react';

import { withHover } from './with-hover.hoc';

const BaseComponentSelector = 'BaseComponent';
const HoverableViewComponent = withHover(View);
const hoverStyle = { backgroundColor: 'black' };
const style = { width: 100, backgroundColor: 'white' };
const MouseEnterEvent = 'mouseEnter';
const MouseLeaveEvent = 'mouseLeave';

describe('withHover HOC', () => {
    describe('basic behavior of hoverable component', () => {
        it('should merge hoverStyle with current style to component styles onMouseEnter', () => {
            expect.hasAssertions();
            const { getByTestId } = render(
                <HoverableViewComponent hoverStyle={hoverStyle} style={style} testID={BaseComponentSelector} />
            );
            const element = getByTestId(BaseComponentSelector);
            expect(element).toHaveStyle(style);
            fireEvent(element, MouseEnterEvent);
            expect(element).toHaveStyle({ ...style, ...hoverStyle });
        });

        it('should remove hoverStyle from component styles onMouseLeave', () => {
            expect.hasAssertions();
            const { getByTestId } = render(
                <HoverableViewComponent hoverStyle={hoverStyle} style={style} testID={BaseComponentSelector} />
            );
            const element = getByTestId(BaseComponentSelector);
            fireEvent(element, MouseEnterEvent);
            fireEvent(element, MouseLeaveEvent);
            expect(element).toHaveStyle(style);
        });
    });

    describe('behavior with children', () => {
        const NestedHoverableText = withHover(Text);
        const nestedStyle = { backgroundColor: 'yellow' };
        const nestedHoverStyle = { backgroundColor: 'blue' };

        it('should merge nestedHoverStyle with nested component styles onMouseEnter to the root element', () => {
            expect.hasAssertions();
            const { getByTestId, getByText } = render(
                <HoverableViewComponent hoverStyle={hoverStyle} style={style} testID={BaseComponentSelector}>
                    <NestedHoverableText hoverStyle={nestedHoverStyle} style={nestedStyle}>
                        text
                    </NestedHoverableText>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(rootElement, MouseEnterEvent);
            expect(nestedElement).toHaveStyle(nestedHoverStyle);
        });

        it('should merge hover styles with styles att all hoverable children levels on mouseEnter to the rootElement', () => {
            expect.hasAssertions();
            const { getByTestId, getByText } = render(
                <HoverableViewComponent hoverStyle={hoverStyle} style={style} testID={BaseComponentSelector}>
                    <HoverableViewComponent>
                        <NestedHoverableText hoverStyle={nestedHoverStyle} style={nestedStyle}>
                            text
                        </NestedHoverableText>
                    </HoverableViewComponent>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(rootElement, MouseEnterEvent);
            expect(nestedElement).toHaveStyle(nestedStyle);
        });

        it('should not merge hoverStyles of nested not hoverable component on mouseEnter', () => {
            expect.hasAssertions();
            const { getByTestId, getByText } = render(
                <HoverableViewComponent hoverStyle={hoverStyle} style={style} testID={BaseComponentSelector}>
                    <Text style={nestedStyle}>text</Text>
                </HoverableViewComponent>
            );
            const baseElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(baseElement, MouseEnterEvent);
            expect(nestedElement).not.toHaveProp('isHovered');
        });

        it('should not merge hoverStyles of hoverable children of nested not hoverable component onMouseEnter to rootElement', () => {
            expect.hasAssertions();
            const { getByTestId, getByText } = render(
                <HoverableViewComponent hoverStyle={hoverStyle} style={style} testID={BaseComponentSelector}>
                    <View>
                        <NestedHoverableText hoverStyle={nestedHoverStyle} style={nestedStyle}>
                            text
                        </NestedHoverableText>
                    </View>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(rootElement, MouseEnterEvent);
            expect(nestedElement).not.toHaveStyle(nestedHoverStyle);
        });
    });
});
