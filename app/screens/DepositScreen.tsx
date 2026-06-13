import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getBalance, saveBalance, addTransaction } from '../storage/wallet';
import { DEFAULT_SETTINGS, getSettings } from '../storage/settings';

export default function DepositScreen() {
  const [balance, setBalanceState] = useState(0);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      getBalance().then(setBalanceState);
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    };
    load();
  }, []));

  const handleDeposit = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid', 'Enter a valid amount');
      return;
    }
    const newBalance = balance + amt;
    await saveBalance(newBalance);
    await addTransaction({
      id: Date.now().toString(), type: 'deposit', amount: amt,
      note: note.trim() || 'Deposit', date: new Date().toLocaleDateString('en-GB'),
    });
    setBalanceState(newBalance);
    setAmount('');
    setNote('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1E" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.title}>Add Money</Text>
          <Text style={styles.subtitle}>CURRENT BALANCE</Text>
          <Text style={styles.balance}>{settings.currencySymbol} {balance.toFixed(2)}</Text>
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <Ionicons name="arrow-down-circle" size={52} color="#4CAF50" />
            </View>
            <TextInput style={styles.input} placeholder="Amount to add (৳)" placeholderTextColor="#555"
              keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
            <TextInput style={styles.input} placeholder="Note (Salary, Gift...)" placeholderTextColor="#555"
              value={note} onChangeText={setNote} />
            <TouchableOpacity style={[styles.depositBtn, success && styles.depositBtnSuccess]}
              onPress={handleDeposit} activeOpacity={0.8}>
              <Ionicons name={success ? 'checkmark-circle' : 'add-circle-outline'} size={22} color="#fff" />
              <Text style={styles.depositBtnText}>{success ? '✓ Added!' : 'Add to Wallet'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1023' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: 4, marginTop: 12 },
  subtitle: { color: '#8A92B2', fontSize: 11, textAlign: 'center', letterSpacing: 2, marginBottom: 4 },
  balance: { color: '#6C63FF', fontSize: 38, fontWeight: '800', textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: '#161C3C', borderRadius: 24, padding: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  iconRow: { alignItems: 'center', marginBottom: 20 },
  input: { backgroundColor: '#0F152F', borderRadius: 14, padding: 16, color: '#fff', fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2E56' },
  depositBtn: { backgroundColor: '#6C63FF', borderRadius: 16, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', elevation: 4 },
  depositBtnSuccess: { backgroundColor: '#4CAF50' },
  depositBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});