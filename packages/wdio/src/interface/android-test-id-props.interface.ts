import type { TestIDProps } from './test-id-props.interface';

/**
 * The testID props produced for Android, where the testID is mirrored to `accessibilityLabel`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#settestid
 */
export interface AndroidTestIDProps extends TestIDProps {
    /** The accessibility label Appium matches the testID against on Android. */
    accessibilityLabel?: string;
}
