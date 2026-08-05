import type { TestIDProps } from './test-id-props.interface.js';
import type { WebSelectorConfig } from '../config/index.js';

export interface WebTestIDProps extends TestIDProps {
    [WebSelectorConfig]?: string;
}
