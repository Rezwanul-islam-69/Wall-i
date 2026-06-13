import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, FlatList, StatusBar, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getBalance, saveBalance, getTransactions, addTransaction, Transaction } from '../storage/wallet';
import { DEFAULT_SETTINGS, getSettings } from '../storage/settings';
import { getThemeColors } from '../utils/theme';
import BrandLogo from '../components/BrandLogo';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [balance, setBalanceState] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const loadData = async () => {
    const bal = await getBalance();
    const txns = await getTransactions();
    const savedSettings = await getSettings();
    setBalanceState(bal);
    setTransactions(txns);
    setSettings(savedSettings);
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const colors = getThemeColors(settings);
  const accent = colors.accent;

  const handleSpend = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid', 'Enter a valid amount');
      return;
    }
    if (amt > balance) {
      Alert.alert('Insufficient Balance', 'Not enough money!');
      return;
    }
    const newBalance = balance - amt;
    await saveBalance(newBalance);
    await addTransaction({
      id: Date.now().toString(), type: 'spend', amount: amt,
      note: note.trim() || 'Expense', date: new Date().toLocaleDateString('en-GB'),
    });
    setBalanceState(newBalance);
    setTransactions(await getTransactions());
    setModalVisible(false);
    setAmount('');
    setNote('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}> 
      <StatusBar barStyle={settings.theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.bg} />
      <View style={styles.pageHeader}>
        <View style={styles.logoSection}>
          <BrandLogo size={96} />
          <View style={styles.logoText}>
            <Text style={[styles.logoName, { color: colors.text }]}>Wall-i</Text>
            <Text style={[styles.logoTagline, { color: colors.accent }]}>Your Money, under control</Text>
          </View>
        </View>
      </View>
      <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.balanceLabel}>YOUR BALANCE</Text>
        {balanceVisible ? (
          <Text style={styles.balanceAmount}>{settings.currencySymbol} {balance.toFixed(2)}</Text>
        ) : (
          <TouchableOpacity style={styles.balanceHidden} onPress={() => setBalanceVisible(true)} activeOpacity={0.8}>
            <Ionicons name="eye-off-outline" size={32} color={colors.accent} />
            <Text style={styles.tapText}>Tap to reveal</Text>
          </TouchableOpacity>
        )}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
            <Ionicons name="remove" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Spend</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: settings.theme === 'light' ? '#1F2656' : '#252D53' }]} onPress={() => navigation.navigate('Deposit')} activeOpacity={0.85}>
            <Ionicons name="add" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.txnContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.sub }]}>No transactions yet</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.txnItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.txnIconBox, { backgroundColor: item.type === 'deposit' ? '#1A3A2A' : '#3A1A1A' }]}>
                  <Ionicons name={item.type === 'deposit' ? 'arrow-down' : 'arrow-up'} size={18}
                    color={item.type === 'deposit' ? '#4CAF50' : '#FF6B6B'} />
                </View>
                <View style={styles.txnDetails}>
                  <Text style={[styles.txnNote, { color: colors.text }]}>{item.note}</Text>
                  <Text style={[styles.txnDate, { color: colors.sub }]}>{item.date}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: item.type === 'deposit' ? '#4CAF50' : '#FF6B6B' }]}>
                  {item.type === 'deposit' ? '+' : '-'}{settings.currencySymbol}{item.amount.toFixed(2)}
                </Text>
              </View>
            )}
          />
        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>💸 Spend Money</Text>
            <TextInput style={styles.input} placeholder="Amount (৳)" placeholderTextColor="#555"
              keyboardType="decimal-pad" value={amount} onChangeText={setAmount} autoFocus />
            <TextInput style={styles.input} placeholder="Note (Lunch, Rickshaw...)" placeholderTextColor="#555"
              value={note} onChangeText={setNote} />
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSpend}>
              <Text style={styles.confirmBtnText}>Confirm Spend</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setModalVisible(false); setAmount(''); setNote(''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1E' },
  pageHeader: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  logoSection: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24 },
  logoText: { marginLeft: 14 },
  logoName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },
  logoTagline: { color: '#6C63FF', fontSize: 12, fontWeight: '600', marginTop: 2 },
  balanceCard: {
    margin: 20,
    backgroundColor: '#141B3E',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  balanceLabel: { color: '#8A92B2', fontSize: 12, marginBottom: 8, letterSpacing: 2 },
  balanceAmount: { color: '#FFFFFF', fontSize: 42, fontWeight: '800', marginBottom: 24, letterSpacing: 0.5 },
  balanceHidden: { alignItems: 'center', marginBottom: 24 },
  tapText: { color: '#6C63FF', fontSize: 14, fontWeight: '600', marginTop: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 18, marginHorizontal: 4 },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 8 },
  txnContainer: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#333', fontSize: 14, marginTop: 12 },
  txnItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#121833', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  txnIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txnDetails: { flex: 1 },
  txnNote: { color: '#fff', fontSize: 14, fontWeight: '600' },
  txnDate: { color: '#555', fontSize: 12, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#141B3E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#2A2A4A' },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#0F0F1E', borderRadius: 14, padding: 16, color: '#fff', fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A4A' },
  confirmBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 8 },
  cancelText: { color: '#666', fontSize: 14 },
});