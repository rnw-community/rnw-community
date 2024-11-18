import { Switch, Text, View, type ViewStyle } from 'react-native';

interface SwitchRowProps {
    readonly setValue: (val: boolean) => void;
    readonly text: string;
    readonly value: boolean;
}

export const SwitchRow = ({ text, value, setValue }: SwitchRowProps): React.ReactNode => (
    <View style={viewStyle}>
        <Text>{text}</Text>
        <Switch
            ios_backgroundColor="#3e3e3e"
            onValueChange={setValue}
            trackColor={{ false: '#767577', true: '#5BC236' }}
            value={value}
        />
    </View>
);

const viewStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
};
