import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface BrandLogoProps {
  size?: number;
}

export default function BrandLogo({ size = 64 }: BrandLogoProps) {
  const img = Image.resolveAssetSource(require('../../assets/app-logo.png'))?.uri;
  return (
    <View style={styles.container}>
      {img ? (
        <Image source={{ uri: img }} style={{ width: size, height: size, resizeMode: 'contain' }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
