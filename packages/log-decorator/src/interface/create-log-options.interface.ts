import type { LogTransportInterface } from './log-transport.interface';

/**
 * The options accepted by `createLogDecorator`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#createlogoptionsinterface
 */
export interface CreateLogOptionsInterface {
    /** The transport every decoration created by the factory writes to. */
    readonly transport: LogTransportInterface;
}
