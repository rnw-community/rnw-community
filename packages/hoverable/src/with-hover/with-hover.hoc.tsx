import React, { useEffect, useMemo, useState } from 'react';

import { cs, emptyFn, isDefined, isString } from '@rnw-community/shared';

import type { HoverProps } from '../hover.props';
import type { Maybe } from '@rnw-community/shared';
import type { ComponentType, PropsWithChildren, ReactElement } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/ban-types
const isReactElement = <P extends object = any>(el: any): el is ReactElement<P> =>
    isDefined(el) && !isString(el) && 'props' in el;

const isHoverableReactElement = (el: Maybe<ReactElement>): boolean =>
    isReactElement<HoverProps>(el) && (el.props.hoverStyle !== undefined || el.props.activeStyle !== undefined);

const useChildrenWithProps = (
    children: ReactElement,
    // eslint-disable-next-line @typescript-eslint/ban-types
    props: object,
    filterFn: (el: ReactElement) => boolean = () => true
): ReactElement[] =>
    useMemo(
        () => React.Children.map(children, (el: ReactElement) => (filterFn(el) ? React.cloneElement(el, props) : el)),
        [children, props, filterFn]
    );

/*
 * TODO: Think and implement native logic, do we need hovers? we do need active state
 * TODO: Mobile support?
 */
export const withHover = <T extends HoverProps = HoverProps>(Component: ComponentType<T>): ComponentType<HoverProps & T> =>
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

        useEffect(() => void setIsHovered(initialIsHovered), [initialIsHovered]);
        useEffect(() => void setIsHovered(isActive ? false : isHovered), [isActive]);

        const handleMouseEnter = (): void => {
            onHover(true);
            setIsHovered(true);
        };
        const handleMouseLeave = (): void => {
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
            // @ts-expect-error Mouse events not available
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
