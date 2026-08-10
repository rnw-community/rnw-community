import type { TestIDProps } from './test-id-props.interface';
import type { WebSelectorConfig } from '../config';

export interface WebTestIDProps extends TestIDProps {
    [WebSelectorConfig]?: string;
}
