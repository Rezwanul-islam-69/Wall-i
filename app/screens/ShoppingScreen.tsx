import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  StatusBar, FlatList, Alert, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getBalance, saveBalance, addTransaction } from '../storage/wallet';
import { DEFAULT_SETTINGS, getSettings } from '../storage/settings';

interface ShoppingItem {
  id: string; name: string; estimatedPrice: string;
  checked: boolean; actualCost?: number;
}

export default function ShoppingScreen() {
  const [balance, setBalanceState] = useState(0);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [checkModal, setCheckModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [actualCost, setActualCost] = useState('');
  const [sessionTotal, setSessionTotal] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useFocusEffect(useCallback(() => {
    const load = async () => {
      getBalance().then(setBalanceState);
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    };
    load();
  }, []));

  const addItem = () => {
    if (!newItemName.trim()) { Alert.alert('Enter item name'); return; }
    setItems(prev => [...prev, { id: Date.now().toString(), name: newItemName.trim(), estimatedPrice: newItemPrice.trim() || '0', checked: false }]);
    setNewItemName(''); setNewItemPrice('');
  };

  const onCheckItem = (item: ShoppingItem) => {
    if (item.checked) return;
    setSelectedItem(item); setActualCost(item.estimatedPrice); setCheckModal(true);
  };

  const confirmCheck = async () => {
    if (!selectedItem) return;
    const cost = parseFloat(actualCost);
    if (isNaN(cost) || cost < 0) {
      Alert.alert('Invalid cost');
      return;
    }
    if (cost > settings.maxTransactionLimit) {
      Alert.alert('Limit exceeded', `Maximum amount per transaction is ${settings.currencySymbol} ${settings.maxTransactionLimit.toLocaleString()}`);
      return;
    }
    if (cost > balance) {
      Alert.alert('Insufficient Balance');
      return;
    }
    const newBalance = balance - cost;
    await saveBalance(newBalance);
    await addTransaction({ id: Date.now().toString(), type: 'shopping', amount: cost, note: `🛒 ${selectedItem.name}`, date: new Date().toLocaleDateString('en-GB') });
    setBalanceState(newBalance);
    setSessionTotal(prev => prev + cost);
    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, checked: true, actualCost: cost } : i));
    setCheckModal(false);
    setActualCost('');
    setSelectedItem(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1E" />
      <View style={styles.header}>
        <Text style={styles.title}>Shopping 🛒</Text>
        <Text style={styles.balanceChip}>{settings.currencySymbol} {balance.toFixed(2)}</Text>
      </View>
      <View style={styles.addBox}>
        <TextInput style={[styles.input, { flex: 2 }]} placeholder="Item name..." placeholderTextColor="#555"
          value={newItemName} onChangeText={setNewItemName} />
        <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Est.৳" placeholderTextColor="#555"
          keyboardType="decimal-pad" value={newItemPrice} onChangeText={setNewItemPrice} />
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {sessionTotal > 0 && (
        <View style={styles.sessionBanner}>
          <Text style={styles.sessionText}>Session Total: ৳{sessionTotal.toFixed(2)}</Text>
        </View>
      )}
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={60} color="#222" />
          <Text style={styles.emptyText}>Add items to your list</Text>
        </View>
      ) : (
        <>
          <FlatList data={items} keyExtractor={item => item.id} contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <View style={[styles.itemRow, item.checked && styles.itemChecked]}>
                <TouchableOpacity style={[styles.checkbox, item.checked && styles.checkboxChecked]} onPress={() => onCheckItem(item)}>
                  {item.checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                </TouchableOpacity>
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.checked ? `Paid: ${settings.currencySymbol}${item.actualCost?.toFixed(2)}` : `Est: ${settings.currencySymbol}${item.estimatedPrice || '?'}`}</Text>
                </View>
                {!item.checked && (
                  <TouchableOpacity onPress={() => setItems(prev => prev.filter(i => i.id !== item.id))}>
                    <Ionicons name="trash-outline" size={20} color="#444" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          <TouchableOpacity style={styles.clearBtn} onPress={() => Alert.alert('Clear List', 'Remove all items?', [{ text: 'Cancel' }, { text: 'Clear', onPress: () => { setItems([]); setSessionTotal(0); }, style: 'destructive' }])}>
            <Text style={styles.clearBtnText}>Clear List</Text>
          </TouchableOpacity>
        </>
      )}
      <Modal visible={checkModal} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>✅ {selectedItem?.name}</Text>
            <Text style={styles.modalSubtitle}>How much did it actually cost?</Text>
            <TextInput style={styles.modalInput} placeholder="Actual cost (৳)" placeholderTextColor="#555"
              keyboardType="decimal-pad" value={actualCost} onChangeText={setActualCost} autoFocus />
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmCheck}>
              <Text style={styles.confirmBtnText}>Confirm & Deduct</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setCheckModal(false); setActualCost(''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1023' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  balanceChip: { backgroundColor: '#161C3C', color: '#6C63FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, fontWeight: '700', fontSize: 14, borderWidth: 1, borderColor: '#2A2E56' },
  addBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, backgroundColor: '#141B3E', borderRadius: 20, paddingVertical: 12, marginHorizontal: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  input: { backgroundColor: '#0F152F', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#2A2E56' },
  addBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 14, marginLeft: 8, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  sessionBanner: { marginHorizontal: 16, marginBottom: 10, backgroundColor: '#161C3C', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2A2E56' },
  sessionText: { color: '#4CAF50', fontWeight: '700', fontSize: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#8A92B2', fontSize: 14, marginTop: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141B3E', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2A2E56', elevation: 2, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  txnIconMargin: { marginRight: 12 },
  itemChecked: { opacity: 0.5 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#6C63FF', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  itemNameChecked: { color: '#555', textDecorationLine: 'line-through' },
  itemPrice: { color: '#666', fontSize: 12, marginTop: 2 },
  clearBtn: { margin: 16, backgroundColor: '#161C3C', borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2A2E56', elevation: 3 },
  clearBtnText: { color: '#FF7A72', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1A1A2E', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { color: '#666', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  modalInput: { backgroundColor: '#0F0F1E', borderRadius: 14, padding: 16, color: '#fff', fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: '#2A2A4A' },
  confirmBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', padding: 8 },
  cancelText: { color: '#666', fontSize: 14 },
});