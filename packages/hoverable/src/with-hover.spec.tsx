// tslint:disable-next-line:no-import-side-effect
import '@testing-library/jest-native/extend-expect';
import { cleanup, fireEvent, NativeTestEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { withHover } from './with-hover.hoc';

const BaseComponentSelector = 'BaseComponent';
const NestedComponentSelector = 'NestedComponent';
const HoverableViewComponent = withHover(View);
const NestedHoverableViewComponent = withHover(View);
const hoverStyle = { backgroundColor: 'black' };
const style = { width: 100, backgroundColor: 'white' };
const MouseEnterEvent = new NativeTestEvent('mouseEnter');
const MouseLeaveEvent = new NativeTestEvent('mouseLeave');

describe('withHover HOC', () => {
    afterEach(cleanup);
    describe('Basic behavior of hoverable component', () => {
        const activeStyle = { backgroundColor: 'green', color: 'red' };
        it('Should merge hoverStyle with current style to component styles onMouseEnter', () => {
            const { getByTestId } = render(
                <HoverableViewComponent testID={BaseComponentSelector} style={style} hoverStyle={hoverStyle} />
            );
            const element = getByTestId(BaseComponentSelector);
            expect(element).toHaveStyle(style);
            fireEvent(element, MouseEnterEvent);
            expect(element).toHaveStyle({ ...style, ...hoverStyle });
        });
        it('Should remove hoverStyle from component styles onMouseLeave', () => {
            const { getByTestId } = render(
                <HoverableViewComponent testID={BaseComponentSelector} style={style} hoverStyle={hoverStyle} />
            );
            const element = getByTestId(BaseComponentSelector);
            fireEvent(element, MouseEnterEvent);
            fireEvent(element, MouseLeaveEvent);
            expect(element).toHaveStyle(style);
        });

        it('test active style', () => {
            const { getByTestId } = render(
                <HoverableViewComponent
                    testID={BaseComponentSelector}
                    isActive={true}
                    style={style}
                    hoverStyle={hoverStyle}
                    activeStyle={activeStyle}
                />
            );
            const element = getByTestId(BaseComponentSelector);
            fireEvent(element, MouseEnterEvent);
            expect(element).toHaveStyle({ ...style, ...activeStyle });
            expect(element).not.toHaveStyle({ ...hoverStyle });
        });

        it('test disabled style', () => {
            const disabledStyle = { backgroundColor: 'red', color: 'red' };
            const { getByTestId } = render(
                <HoverableViewComponent
                    testID={BaseComponentSelector}
                    isActive={true}
                    isDisabled={true}
                    style={style}
                    hoverStyle={hoverStyle}
                    activeStyle={activeStyle}
                    disabledStyle={disabledStyle}
                />
            );
            const element = getByTestId(BaseComponentSelector);
            fireEvent(element, MouseEnterEvent);
            expect(element).toHaveStyle({ ...style, ...disabledStyle });
            expect(element).not.toHaveStyle({ ...hoverStyle });
            expect(element).not.toHaveStyle({ ...activeStyle });
        });
    });
    describe('Behavior with children', () => {
        const NestedHoverableText = withHover(Text);
        const nestedStyle = { backgroundColor: 'yellow' };
        const nestedHoverStyle = { backgroundColor: 'blue' };
        const nestedActiveStyle = { backgroundColor: 'black' };

        it('Should merge nestedHoverStyle with nested component styles onMouseEnter to the root element', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={BaseComponentSelector}>
                    <NestedHoverableText style={nestedStyle} hoverStyle={nestedHoverStyle}>
                        text
                    </NestedHoverableText>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(rootElement, MouseEnterEvent);
            expect(nestedElement).toHaveStyle(nestedHoverStyle);
        });

        it('1', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent
                    style={style}
                    isActive={true}
                    activeStyle={hoverStyle}
                    testID={BaseComponentSelector}
                >
                    <NestedHoverableText style={nestedStyle} activeStyle={nestedActiveStyle}>
                        text
                    </NestedHoverableText>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(rootElement, MouseEnterEvent);
            expect(nestedElement).toHaveStyle(nestedActiveStyle);
        });

        it('Should merge hover styles with styles att all hoverable children levels on mouseEnter to the rootElement', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={BaseComponentSelector}>
                    <HoverableViewComponent>
                        <NestedHoverableText style={nestedStyle} hoverStyle={nestedHoverStyle}>
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

        it('Should not merge hoverStyles of nested not hoverable component on mouseEnter', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={BaseComponentSelector}>
                    <Text style={nestedStyle}>text</Text>
                </HoverableViewComponent>
            );
            const baseElement = getByTestId(BaseComponentSelector);
            const nestedElement = getByText('text');
            fireEvent(baseElement, MouseEnterEvent);
            expect(nestedElement.props.style).toStrictEqual(nestedStyle);
        });

        it('Should not merge hoverStyles of hoverable children of nested not hoverable component onMouseEnter to rootElement', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={BaseComponentSelector}>
                    <View>
                        <NestedHoverableText style={nestedStyle} hoverStyle={nestedHoverStyle}>
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
