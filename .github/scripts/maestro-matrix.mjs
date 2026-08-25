import { readFileSync } from 'node:fs';
import process from 'node:process';

// Every example package that carries a Maestro suite, with the app targets whose
// native projects exist in the repository. `bare` targets need a committed
// ios/ + android/ project; expo targets generate theirs with `expo prebuild`.
// Members are per target, so a change confined to one app target does not run the
// other target's suite. The last member is the app workspace itself, and the
// emitted build filter is `...<app workspace>` so Turbo builds every workspace
// package the app's Metro bundle imports, not just the library under test.
const EXAMPLES = [
    {
        package: 'payments',
        exampleDir: 'packages/react-native-payments-example',
        targets: {
            bare: {
                iosScheme: 'ReactNativePaymentsExample',
                members: [
                    '@rnw-community/react-native-payments',
                    '@rnw-community/react-native-payments-example',
                    '@rnw-community/react-native-payments-example-bare',
                ],
            },
            expo: {
                iosScheme: 'reactnativepaymentsexpoexample',
                members: [
                    '@rnw-community/react-native-payments',
                    '@rnw-community/react-native-payments-example',
                    '@rnw-community/react-native-payments-example-expo',
                ],
            },
        },
    },
    {
        package: 'collapsible-header',
        exampleDir: 'packages/react-native-collapsible-header-example',
        targets: {
            bare: {
                iosScheme: 'ReactNativeCollapsibleHeaderExample',
                members: [
                    '@rnw-community/react-native-collapsible-header',
                    '@rnw-community/react-native-collapsible-header-example',
                    '@rnw-community/react-native-collapsible-header-example-bare',
                ],
            },
            expo: {
                iosScheme: 'reactnativecollapsibleheaderexpoexample',
                members: [
                    '@rnw-community/react-native-collapsible-header',
                    '@rnw-community/react-native-collapsible-header-example',
                    '@rnw-community/react-native-collapsible-header-example-expo',
                ],
            },
        },
    },
];

const [, , affectedFilePath] = process.argv;
const raw = affectedFilePath === undefined ? '' : readFileSync(affectedFilePath, 'utf8').trim();
// An empty file means "not a pull request", where every suite runs.
const affectedNames =
    raw === '' ? null : new Set((JSON.parse(raw).packages?.items ?? []).map(item => item.name));
const isAffected = members => affectedNames === null || members.some(name => affectedNames.has(name));

const include = EXAMPLES.flatMap(example =>
    Object.entries(example.targets)
        .filter(([, { members }]) => isAffected(members))
        .map(([target, { iosScheme, members }]) => ({
            package: example.package,
            target,
            example_dir: example.exampleDir,
            build_filter: `...${members[members.length - 1]}`,
            ios_scheme: iosScheme,
        }))
);

process.stdout.write(`matrix=${JSON.stringify(include)}\n`);
process.stdout.write(`any=${String(include.length > 0)}\n`);
