import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Circle, Rect } from 'react-native-svg';

interface BrandLogoProps {
  size?: number;
}

export default function BrandLogo({ size = 44 }: BrandLogoProps) {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7D6CFF" />
            <Stop offset="100%" stopColor="#57D1FF" />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="28" fill="url(#brandGradient)" />
        <Rect x="16" y="20" width="32" height="24" rx="10" fill="#fff" opacity="0.9" />
        <Path d="M22 28h20" stroke="#7D6CFF" strokeWidth="3" strokeLinecap="round" />
        <Path d="M22 34h16" stroke="#57D1FF" strokeWidth="3" strokeLinecap="round" />
        <Path d="M40 26v10" stroke="#7D6CFF" strokeWidth="2" strokeLinecap="round" />
      </Svg>
      <Text style={styles.label}>Wall-i</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.5,
    marginLeft: 10,
  },
});
