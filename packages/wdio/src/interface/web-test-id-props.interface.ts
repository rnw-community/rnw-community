import type { TestIDProps } from './test-id-props.interface';
import type { WebSelectorConfig } from '../config';

/**
 * The testID props produced for web, where the testID is rendered as the `data-test-id` attribute.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/wdio/readme.md#settestid
 */
export interface WebTestIDProps extends TestIDProps {
    /** The `data-test-id` attribute web selectors match against. */
    [WebSelectorConfig]?: string;
}
