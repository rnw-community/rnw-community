import type { IOSTestIDProps } from './ios-test-id-props.interface';

export interface AndroidTestIDProps extends IOSTestIDProps {
    accessibilityLabel: string;
}
