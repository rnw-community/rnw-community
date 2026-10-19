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
    {
        package: 'screen-chrome',
        exampleDir: 'packages/react-native-screen-chrome-example',
        buildFilter: '@rnw-community/react-native-screen-chrome',
        targets: {
            bare: {
                iosScheme: 'ReactNativeScreenChromeExample',
                members: [
                    '@rnw-community/react-native-screen-chrome',
                    '@rnw-community/react-native-screen-chrome-example',
                    '@rnw-community/react-native-screen-chrome-example-bare',
                ],
            },
            expo: {
                iosScheme: 'reactnativescreenchromeexpoexample',
                members: [
                    '@rnw-community/react-native-screen-chrome',
                    '@rnw-community/react-native-screen-chrome-example',
                    '@rnw-community/react-native-screen-chrome-example-expo',
                ],
            },
        },
    },
];

// The app ids come from the example's own `e2e:<platform>:<target>` scripts, so the
// workflows and a local `pnpm e2e:*` run can never disagree about which app the
// suite drives.
const readAppId = (exampleDir, platform, target) => {
    const { scripts } = JSON.parse(readFileSync(`${exampleDir}/package.json`, 'utf8'));
    const appId = /-e APP_ID=(\S+)/u.exec(scripts?.[`e2e:${platform}:${target}`] ?? '')?.[1];
    if (appId === undefined) {
        throw new Error(`${exampleDir}/package.json has no e2e:${platform}:${target} script passing -e APP_ID=<id>`);
    }

    return appId;
};

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
            ios_app_id: readAppId(example.exampleDir, 'ios', target),
            android_app_id: readAppId(example.exampleDir, 'android', target),
        }))
);

process.stdout.write(`matrix=${JSON.stringify(include)}\n`);
process.stdout.write(`any=${String(include.length > 0)}\n`);
