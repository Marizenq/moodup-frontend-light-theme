/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#4B5563',

    background: '#F8FAFC',
    card: '#FFFFFF',

    tint: '#14B8A6',
    primary: '#14B8A6',

    border: '#D1D5DB',

    icon: '#374151',

    danger: '#DC2626',

    tabIconDefault: '#6B7280',
    tabIconSelected: '#14B8A6',
  },

  dark: {
    text: '#FFFFFF',
    textSecondary: '#94A3B8',

    background: '#020817',
    card: '#0F172A',

    tint: '#2DD4BF',
    primary: '#2DD4BF',

    border: '#1E293B',

    icon: '#CBD5E1',

    danger: '#EF4444',

    tabIconDefault: '#94A3B8',
    tabIconSelected: '#2DD4BF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
