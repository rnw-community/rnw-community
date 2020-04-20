module.exports = {
    projects: ["./packages/*/jest.config.js"],
    coverageReporters: ['text-summary'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 62,
            branches: 40,
            functions: 45,
            lines: 65
        }
    },
};
