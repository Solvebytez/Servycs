import React from 'react';
import { View } from 'react-native';
import { ResponsiveText } from '@/components';
import { COLORS, FONT_SIZE } from '@/constants';

export const AuthSeparator: React.FC = () => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    }}>
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border.light }} />
      <ResponsiveText
        variant="caption1"
        weight="medium"
        color={COLORS.text.secondary}
        style={{
          marginHorizontal: 16,
        }}
      >
        or
      </ResponsiveText>
      <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border.light }} />
    </View>
  );
};

export default AuthSeparator;
