module.exports = {
    projects: ['packages/*/jest.config.js'],
    coverageReporters: ['text-summary', 'lcov'],
    reporters: ['default'],
    coverageThreshold: {
        global: {
            statements: 96.8,
            branches: 81.5,
            functions: 91,
            lines: 96,
        },
    },
};
