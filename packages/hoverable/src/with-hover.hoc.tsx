import { cs, emptyFn, Maybe } from '@rnw-community/shared';
import React, { ComponentType, PropsWithChildren, ReactElement, useEffect, useMemo, useState } from 'react';

import { HoverProps } from './hover.props';

const isHoverableReactElement = (el: Maybe<ReactElement>) =>
    el !== null &&
    (el.props?.hoverStyle !== undefined || el.props?.activeStyle !== undefined || el.props?.hoverColor !== undefined || el.props?.activeColor !== undefined);

const useChildrenWithProps = (children: ReactElement, props: object, filterFn: (el: ReactElement) => boolean = () => true) =>
    useMemo(() => React.Children.map(children, (el: ReactElement) => (filterFn(el) ? React.cloneElement(el, props) : el)), [
        children,
        props,
        filterFn,
    ]);

// TODO: Think and implement native logic, do we need hovers? we do need active state
// TODO: Mobile support?
export const withHover = <T extends HoverProps = HoverProps>(Component: ComponentType<T>): ComponentType<T & HoverProps> =>
    React.memo<T>((props: PropsWithChildren<T>) => {
        const {
            style,
            hoverStyle,
            activeStyle = hoverStyle,
            disabledStyle = activeStyle,
            isHovered: initialIsHovered = false,
            isActive = false,
            isDisabled = false,
            isNested = false,
            children,
            onHover = emptyFn,
            ...componentProps
        } = props;
        const [isHovered, setIsHovered] = useState(initialIsHovered);

        useEffect(() => setIsHovered(initialIsHovered), [initialIsHovered]);
        useEffect(() => setIsHovered(isActive ? false : isHovered), [isActive]);

        const handleMouseEnter = () => {
            onHover(true);
            setIsHovered(true);
        };
        const handleMouseLeave = () => {
            onHover(false);
            setIsHovered(false);
        };

        const hoverableChildren = useChildrenWithProps(
            children as ReactElement,
            { isHovered, isActive, isDisabled, isNested: true },
            isHoverableReactElement
        );

        const styles = [
            style,
            cs(isDisabled, disabledStyle),
            cs(isActive && !isDisabled, activeStyle),
            cs(!isActive && !isDisabled && isHovered, hoverStyle),
        ];

        // Nested hoverables should not handle mouse events, state should come from the parents
        const hasMouseEvents = !isNested && !isActive && !isDisabled;

        return (
            // @ts-ignore
            <Component
                style={styles}
                {...(hasMouseEvents && { onMouseEnter: handleMouseEnter })}
                {...(hasMouseEvents && { onMouseLeave: handleMouseLeave })}
                {...componentProps}
            >
                {hoverableChildren}
            </Component>
        );
    });
