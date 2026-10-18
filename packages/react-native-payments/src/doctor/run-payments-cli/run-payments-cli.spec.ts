import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { runPaymentsDoctor } from '../run-payments-doctor/run-payments-doctor';

import { runPaymentsCli } from './run-payments-cli';

jest.mock('../run-payments-doctor/run-payments-doctor', () => ({ runPaymentsDoctor: jest.fn() }));

const runDoctor = jest.mocked(runPaymentsDoctor);
const stdout = jest.spyOn(process.stdout, 'write');
const stderr = jest.spyOn(process.stderr, 'write');

describe('runPaymentsCli', () => {
    beforeEach(() => {
        stdout.mockReturnValue(true);
        stderr.mockReturnValue(true);
    });

    it('should print the usage and fail for an unknown command', async () => {
        expect.hasAssertions();

        await expect(runPaymentsCli(['check'], '/app')).resolves.toBe(1);
        expect(stderr).toHaveBeenLastCalledWith('Usage: rnw-payments doctor [--fix]\n');
        expect(runDoctor).not.toHaveBeenCalled();
    });

    it('should succeed when every native file matches the payments config', async () => {
        expect.hasAssertions();

        runDoctor.mockResolvedValueOnce([]);

        await expect(runPaymentsCli(['doctor'], '/app')).resolves.toBe(0);
        expect(runDoctor).toHaveBeenLastCalledWith('/app', false);
        expect(stdout).toHaveBeenLastCalledWith('Native payments setup matches the payments config.\n');
    });

    it('should print every drift and fail without --fix', async () => {
        expect.hasAssertions();

        runDoctor.mockResolvedValueOnce(['drift']);

        await expect(runPaymentsCli(['doctor'], '/app')).resolves.toBe(1);
        expect(stdout).toHaveBeenLastCalledWith(
            'drift\n\n1 file(s) do not match the payments config, run "rnw-payments doctor --fix".\n'
        );
    });

    it('should print every fixed drift and succeed with --fix', async () => {
        expect.hasAssertions();

        runDoctor.mockResolvedValueOnce(['drift']);

        await expect(runPaymentsCli(['doctor', '--fix'], '/app')).resolves.toBe(0);
        expect(runDoctor).toHaveBeenLastCalledWith('/app', true);
        expect(stdout).toHaveBeenLastCalledWith('drift\n\nFixed 1 file(s).\n');
    });

    it('should print the failure and fail when the doctor throws', async () => {
        expect.hasAssertions();

        runDoctor.mockRejectedValueOnce(new Error('missing config'));
        runDoctor.mockRejectedValueOnce('not an error');

        await expect(runPaymentsCli(['doctor'], '/app')).resolves.toBe(1);
        expect(stderr).toHaveBeenLastCalledWith('missing config\n');
        await expect(runPaymentsCli(['doctor'], '/app')).resolves.toBe(1);
        expect(stderr).toHaveBeenLastCalledWith('not an error\n');
    });
});
