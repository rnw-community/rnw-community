const version = '${version}';

module.exports = {
    plugins: {
        '@release-it/conventional-changelog': {
            preset: {
                name: 'conventionalcommits',
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
