module.exports = {
    projects: ["packages/*/jest.config.js"],
    coverageReporters: ['text-summary', 'json'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 99,
            branches: 99,
            functions: 99,
            lines: 99
        }
    },
};
