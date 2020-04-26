// tslint:disable-next-line:no-import-side-effect
import '@testing-library/jest-native/extend-expect';
import { cleanup, fireEvent, NativeTestEvent, render } from '@testing-library/react-native';
import React, { FC } from 'react';
import { StyleProp, Text, TextStyle, View } from 'react-native';

import { withHover } from './with-hover.hoc';

interface Props {
    style?: StyleProp<TextStyle>;
    testID?: string;
}

enum SelectorEnum {
    BaseComponent = 'BaseComponent',
}

const Component: FC<Props> = ({ children, ...props }) => <View {...props}>{children}</View>;
const HoverableViewComponent = withHover(Component);
const hoverStyle = { backgroundColor: 'black' };
const style = { width: 100, backgroundColor: 'white' };

describe('withHover HOC', () => {
    afterEach(cleanup);
    describe('Basic behavior of hoverable component', () => {
        it('Should merge hoverStyle with current style to component styles onMouseEnter', () => {
            const { getByTestId } = render(
                <HoverableViewComponent testID={SelectorEnum.BaseComponent} style={style} hoverStyle={hoverStyle} />
            );
            const element = getByTestId(SelectorEnum.BaseComponent);
            expect(element).toHaveStyle(style);
            fireEvent(element, new NativeTestEvent('mouseEnter'));
            expect(element).toHaveStyle({ ...style, ...hoverStyle });
        });
        it('Should remove hoverStyle from component styles onMouseLeave', () => {
            const { getByTestId } = render(
                <HoverableViewComponent testID={SelectorEnum.BaseComponent} style={style} hoverStyle={hoverStyle} />
            );
            const element = getByTestId(SelectorEnum.BaseComponent);
            fireEvent(element, new NativeTestEvent('mouseEnter'));
            fireEvent(element, new NativeTestEvent('mouseLeave'));
            expect(element).toHaveStyle(style);
        });
    });
    describe('Behavior with children', () => {
        const NestedHoverableText = withHover(Text);
        const nestedStyle = { backgroundColor: 'yellow' };
        const nestedHoverStyle = { backgroundColor: 'blue' };

        afterEach(cleanup);
        it('Should merge nestedHoverStyle with nested component styles onMouseEnter to the root element', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={SelectorEnum.BaseComponent}>
                    <NestedHoverableText style={nestedStyle} hoverStyle={nestedHoverStyle}>
                        text
                    </NestedHoverableText>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(SelectorEnum.BaseComponent);
            const nestedElement = getByText('text');
            fireEvent(rootElement, new NativeTestEvent('mouseEnter'));
            expect(nestedElement).toHaveStyle(nestedHoverStyle);
        });

        it('Should merge hover styles with styles att all hoverable children levels on mouseEnter to the rootElement', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={SelectorEnum.BaseComponent}>
                    <HoverableViewComponent>
                        <NestedHoverableText style={nestedStyle} hoverStyle={nestedHoverStyle}>
                            text
                        </NestedHoverableText>
                    </HoverableViewComponent>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(SelectorEnum.BaseComponent);
            const nestedElement = getByText('text');
            fireEvent(rootElement, new NativeTestEvent('mouseEnter'));
            expect(nestedElement).toHaveStyle(nestedStyle);
            expect(nestedElement).toHaveProp('isHovered', true);
        });

        it('Should not merge hoverStyles of nested not hoverable component on mouseEnter', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={SelectorEnum.BaseComponent}>
                    <Text style={nestedStyle}>text</Text>
                </HoverableViewComponent>
            );
            const baseElement = getByTestId(SelectorEnum.BaseComponent);
            const nestedElement = getByText('text');
            fireEvent(baseElement, new NativeTestEvent('mouseEnter'));
            expect(nestedElement).not.toHaveProp('isHovered');
        });

        it('Should not merge hoverStyles of hoverable children of nested not hoverable component onMouseEnter to rootElement', () => {
            const { getByTestId, getByText } = render(
                <HoverableViewComponent style={style} hoverStyle={hoverStyle} testID={SelectorEnum.BaseComponent}>
                    <View>
                        <NestedHoverableText style={nestedStyle} hoverStyle={nestedHoverStyle}>
                            text
                        </NestedHoverableText>
                    </View>
                </HoverableViewComponent>
            );
            const rootElement = getByTestId(SelectorEnum.BaseComponent);
            const nestedElement = getByText('text');
            fireEvent(rootElement, new NativeTestEvent('mouseEnter'));
            expect(nestedElement).toHaveStyle(nestedStyle);
        });
    });
});
