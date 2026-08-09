import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import { WebSelectorConfig } from '../../config/index.js';
import { Platform } from '../get-platform/get-platform.util.js';

import type { AndroidTestIDProps, TestIDProps, WebTestIDProps } from '../../interface/index.js';

const isWebTestIDProps = (props: AndroidTestIDProps | TestIDProps | WebTestIDProps): props is Required<WebTestIDProps> =>
    WebSelectorConfig in props && isDefined(props[WebSelectorConfig]);

export const getTestID = (props: AndroidTestIDProps | TestIDProps | WebTestIDProps, defaultTestID = ''): string => {
    if (Platform.OS === 'web' && isWebTestIDProps(props)) {
        return props[WebSelectorConfig];
    } else if (isNotEmptyString(props.testID)) {
        return props.testID;
    }

    return defaultTestID;
};
