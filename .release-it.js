const version = '${version}';

module.exports = {
    plugins: {
        '@release-it/conventional-changelog': {
            path: '.',
            infile: 'CHANGELOG.md',
            preset: 'conventionalcommits',
            gitRawCommitsOpts: {
                path: '.',
            },
        },
        '@release-it-plugins/workspaces': true,
    },
    git: {
        commitMessage: `chore: released version v${version} [no ci]`,
        requireBranch: 'master',
    },
    github: {
        release: true,
    },
    npm: {
        publish: true,
    },
};
