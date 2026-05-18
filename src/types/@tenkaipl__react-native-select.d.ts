declare module '@tenkaipl/react-native-select' {
  import { ComponentType } from 'react';
  import { ViewStyle } from 'react-native';

  interface Option {
    label: string;
    value: string;
  }

  interface ReactNativeSelectProps {
    options: Option[];
    value: string;
    onChange: (item: Option) => void;
    placeholder?: string;
    disabled?: boolean;
    theme?: 'light' | 'dark';
    colors?: {
      primary?: string;
      colorTextPrimary?: string;
      colorTextSecondary?: string;
      border?: string;
      secondary?: string;
      selected?: string;
      lines?: string;
    };
    triggerStyle?: ViewStyle;
    dropdownStyle?: ViewStyle;
    itemStyle?: ViewStyle;
    style?: ViewStyle;
  }

  const ReactNativeSelect: ComponentType<ReactNativeSelectProps>;
  export default ReactNativeSelect;
}