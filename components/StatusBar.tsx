import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '@/constants';

interface GlobalStatusBarProps {
  barStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
  translucent?: boolean;
}

export const GlobalStatusBar: React.FC<GlobalStatusBarProps> = ({
  barStyle = 'light-content',
  backgroundColor = COLORS.primary[300],
  translucent = true
}) => {
  return (
    <RNStatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={translucent}
    />
  );
};

export default GlobalStatusBar;
