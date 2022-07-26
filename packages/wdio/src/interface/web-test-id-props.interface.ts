import type { WebSelectorConfig } from '../config';
import type { TestIDProps } from './test-id-props.interface';

export interface WebTestIDProps extends TestIDProps {
    [WebSelectorConfig]: string;
}
