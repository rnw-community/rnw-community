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
    },
    git: {
        push: false,
        tagName: `v${version}`,
        pushRepo: 'git@github.com:rnw-community/rnw-community.git',
        commitsPath: '.',
        commitMessage: `chore: released version v${version} [no ci]`,
        requireCommits: true,
        requireCommitsFail: false,
    },
    github: {
        release: true,
    },
};
