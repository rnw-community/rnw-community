module.exports = {
    projects: ["packages/*/jest.config.js"],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 97.5,
            branches: 90.5,
            functions: 94,
            lines: 99
        }
    },
};
