import { getErrorMessage, isEmptyArray } from '@rnw-community/shared';

import { runPaymentsDoctor } from '../run-payments-doctor/run-payments-doctor';

const usage = 'Usage: rnw-payments doctor [--fix]\n';

const getSummary = (drifts: string[], fix: boolean): string => {
    if (isEmptyArray(drifts)) {
        return 'Native payments setup matches the payments config.\n';
    }

    return fix
        ? `Fixed ${drifts.length} file(s).\n`
        : `${drifts.length} file(s) do not match the payments config, run "rnw-payments doctor --fix".\n`;
};

export const runPaymentsCli = async ([command, ...flags]: string[], projectRoot: string): Promise<number> => {
    if (command !== 'doctor') {
        process.stderr.write(usage);

        return 1;
    }

    const fix = flags.includes('--fix');

    try {
        const drifts = await runPaymentsDoctor(projectRoot, fix);

        process.stdout.write([...drifts, getSummary(drifts, fix)].join('\n\n'));

        return fix || isEmptyArray(drifts) ? 0 : 1;
    } catch (error) {
        process.stderr.write(`${getErrorMessage(error, String(error))}\n`);

        return 1;
    }
};
