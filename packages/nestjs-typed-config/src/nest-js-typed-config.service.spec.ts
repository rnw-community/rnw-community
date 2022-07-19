import { unlinkSync, writeFileSync } from 'fs';

import { ConfigService as NestConfigService } from '@nestjs/config';

import { NestJSTypedConfigService } from './nest-js-typed-config.service';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@nestjs/common', () => ({ ...jest.requireActual('@nestjs/common'), Logger: { debug: jest.fn() } }));
jest.mock('@nestjs/config', () => ({ ConfigService: jest.fn().mockImplementation(() => ({ get: jest.fn() })) }));

enum EnvironmentVariablesEnum {
    ENV_VARIABLE = 'ENV_VARIABLE',
    ENV_VARIABLE_FILE = 'ENV_VARIABLE_FILE',
}

interface EnvironmentVariablesInterface {
    [EnvironmentVariablesEnum.ENV_VARIABLE]: string;
    [EnvironmentVariablesEnum.ENV_VARIABLE_FILE]: string;
}

class ConfigService extends NestJSTypedConfigService<EnvironmentVariablesEnum, EnvironmentVariablesInterface> {}

describe('NestJSTypedConfigService', () => {
    it('should get value from environment using enum', () => {
        expect.assertions(2);

        const nestConfigService = new NestConfigService<EnvironmentVariablesInterface>();
        const service = new ConfigService(nestConfigService);

        const nestConfigGetSpy = jest.spyOn(nestConfigService, 'get');

        const expectedResult = 'value';
        nestConfigGetSpy.mockReturnValue(expectedResult);

        expect(service.get(EnvironmentVariablesEnum.ENV_VARIABLE)).toBe(expectedResult);
        expect(nestConfigGetSpy).toHaveBeenCalledWith(EnvironmentVariablesEnum.ENV_VARIABLE);
    });

    it('should get value from file using enum', () => {
        expect.assertions(2);

        const nestConfigService = new NestConfigService<EnvironmentVariablesInterface>();
        const service = new ConfigService(nestConfigService);

        const nestConfigGetSpy = jest.spyOn(nestConfigService, 'get');

        const filePath = './test-file';
        const expectedResult = 'file value';

        nestConfigGetSpy.mockReturnValue(filePath);

        writeFileSync(filePath, expectedResult);
        const actualResult = service.get(EnvironmentVariablesEnum.ENV_VARIABLE_FILE);
        unlinkSync(filePath);

        expect(actualResult).toBe(expectedResult);
        expect(nestConfigGetSpy).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if file doesn't exist", () => {
        expect.assertions(1);

        const nestConfigService = new NestConfigService<EnvironmentVariablesInterface>();
        const service = new ConfigService(nestConfigService);

        const nestConfigGetSpy = jest.spyOn(nestConfigService, 'get');

        const filePath = './test-file';
        nestConfigGetSpy.mockReturnValue(filePath);

        expect(() => service.get(EnvironmentVariablesEnum.ENV_VARIABLE_FILE)).toThrow(
            `Could not read file "${EnvironmentVariablesEnum.ENV_VARIABLE_FILE}"`
        );
    });

    it('should try to get variable from environment if file is not set', () => {
        expect.assertions(2);

        const nestConfigService = new NestConfigService<EnvironmentVariablesInterface>();
        const service = new ConfigService(nestConfigService);

        const nestConfigGetSpy = jest.spyOn(nestConfigService, 'get');

        const expectedResult = 'file value';
        nestConfigGetSpy.mockImplementation(envVar =>
            // eslint-disable-next-line jest/no-conditional-in-test
            envVar === EnvironmentVariablesEnum.ENV_VARIABLE ? expectedResult : undefined
        );

        const actualResult = service.get(EnvironmentVariablesEnum.ENV_VARIABLE_FILE);

        expect(actualResult).toBe(expectedResult);
        expect(nestConfigGetSpy).toHaveBeenCalledTimes(2);
    });

    it('should get value from cache using enum', () => {
        expect.assertions(2);

        const nestConfigService = new NestConfigService<EnvironmentVariablesInterface>();
        const service = new ConfigService(nestConfigService);

        const nestConfigGetSpy = jest.spyOn(nestConfigService, 'get');

        nestConfigGetSpy.mockReturnValue('cached');
        service.get(EnvironmentVariablesEnum.ENV_VARIABLE);

        nestConfigGetSpy.mockReturnValue('not cached');

        expect(service.get(EnvironmentVariablesEnum.ENV_VARIABLE)).toBe('cached');
        expect(nestConfigGetSpy).toHaveBeenCalledTimes(1);
    });
});
