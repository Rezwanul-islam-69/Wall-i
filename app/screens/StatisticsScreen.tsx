import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, Transaction } from '../storage/wallet';
import { DEFAULT_SETTINGS, getSettings } from '../storage/settings';
import { getThemeColors } from '../utils/theme';

const CATEGORY_RULES = [
  {
    label: 'Food',
    keywords: ['lunch', 'dinner', 'breakfast', 'coffee', 'cafe', 'restaurant', 'meal', 'snack'],
    color: '#FF7A7A',
  },
  {
    label: 'Transport',
    keywords: ['bus', 'train', 'taxi', 'auto', 'ride', 'fare', 'uber', 'bolt', 'rickshaw', 'fuel', 'petrol', 'transport'],
    color: '#4FC1FF',
  },
  {
    label: 'Utilities',
    keywords: ['bill', 'electric', 'water', 'utility', 'internet', 'mobile', 'rent', 'subscription', 'wifi'],
    color: '#FFD466',
  },
  {
    label: 'Shopping',
    keywords: ['shop', 'shopping', 'cart', 'mall', 'order', 'buy', '🛒', 'cart'],
    color: '#B96CFF',
  },
];

const defaultCategoryColors = ['#6C63FF', '#FFB54D', '#34D399', '#F472B6', '#60A5FA'];

function parseGbDate(dateString: string) {
  const parts = dateString.split('/').map((part) => Number(part));
  if (parts.length === 3 && parts.every((value) => Number.isFinite(value))) {
    const [day, month, year] = parts;
    return new Date(year, month - 1, day);
  }
  return new Date(dateString);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function categorizeExpense(txn: Transaction) {
  const note = txn.note.toLowerCase();
  if (txn.type === 'shopping') {
    return 'Shopping';
  }

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => note.includes(keyword))) {
      return rule.label;
    }
  }

  if (note.includes('expense') || note.includes('spend') || note.includes('shopping')) {
    return 'Other';
  }
  return 'Other';
}

function fmt(value: number) {
  return value.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StatisticsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const colors = getThemeColors(settings);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const stored = await getTransactions();
        const savedSettings = await getSettings();
        setTransactions(stored);
        setSettings(savedSettings);
      };
      load();
    }, [])
  );

  const today = new Date();
  const todayTransactions = transactions.filter((txn) => isSameDay(parseGbDate(txn.date), today));
  const todayExpenses = todayTransactions.filter((txn) => txn.type !== 'deposit');
  const totalSpent = todayExpenses.reduce((sum, txn) => sum + txn.amount, 0);
  const totalDeposited = todayTransactions
    .filter((txn) => txn.type === 'deposit')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const categoryTotals = todayExpenses.reduce<Record<string, number>>((acc, txn) => {
    const category = categorizeExpense(txn);
    acc[category] = (acc[category] || 0) + txn.amount;
    return acc;
  }, {});

  const segments = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .map(([label, amount], index) => {
      const rule = CATEGORY_RULES.find((entry) => entry.label === label);
      return {
        label,
        amount,
        color: rule?.color ?? defaultCategoryColors[index % defaultCategoryColors.length],
        percent: totalSpent > 0 ? amount / totalSpent : 0,
      };
    });

  const donutRadius = 50;
  const circumference = 2 * Math.PI * donutRadius;
  let dashOffset = 0;

  const topCategory = segments.reduce((best, segment) => {
    if (!best || segment.amount > best.amount) return segment;
    return best;
  }, null as { label: string; amount: number; color: string; percent: number } | null);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Text style={[styles.heroTitle, { color: colors.text }]}>Wellbeing dashboard</Text>
        <Text style={[styles.heroSubtitle, { color: colors.sub }]}>An Android Digital Wellbeing-inspired snapshot of today’s spending.</Text>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View style={styles.chartWrap}>
          <Svg width={220} height={220} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="58" fill={colors.card} />
            {segments.map((segment) => {
              const segmentLength = Math.max(segment.percent * circumference, 0.001);
              const circle = (
                <Circle
                  key={segment.label}
                  cx="60"
                  cy="60"
                  r={donutRadius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={18}
                  strokeDasharray={`${segmentLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              );
              dashOffset -= segmentLength;
              return circle;
            })}
            <Circle cx="60" cy="60" r="36" fill={colors.surface} />
          </Svg>
          <View style={[styles.donutCenter, { backgroundColor: colors.surface }]}> 
            <Text style={[styles.donutTitle, { color: colors.text }]}>{settings.currencySymbol}{fmt(totalSpent)}</Text>
            <Text style={[styles.donutSubtitle, { color: colors.sub }]}>spent today</Text>
          </View>
        </View>

        <View style={styles.legendList}>
          {segments.length > 0 ? (
            segments.map((segment) => (
              <View key={segment.label} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                <View style={styles.legendTextArea}>
                  <Text style={[styles.legendLabel, { color: colors.text }]}>{segment.label}</Text>
                  <Text style={[styles.legendMeta, { color: colors.sub }]}> {settings.currencySymbol}{fmt(segment.amount)} · {Math.round(segment.percent * 100)}%</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyState, { color: colors.sub }]}>No expense activity recorded today.</Text>
          )}
        </View>
      </View>

      <View style={[styles.statsGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: colors.sub }]}>Transactions</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{todayTransactions.length}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: colors.sub }]}>Deposited</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{settings.currencySymbol}{fmt(totalDeposited)}</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: colors.sub }]}>Average expense</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {settings.currencySymbol}{fmt(todayExpenses.length ? totalSpent / todayExpenses.length : 0)}
          </Text>
        </View>
        <View style={styles.statTile}>
          <Text style={[styles.statLabel, { color: colors.sub }]}>Top category</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{topCategory?.label ?? 'None'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, lineHeight: 20 },
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  donutCenter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTitle: { fontSize: 20, fontWeight: '800' },
  donutSubtitle: { fontSize: 12, marginTop: 4 },
  legendList: { width: '100%', marginTop: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendTextArea: { flex: 1 },
  legendLabel: { fontSize: 14, fontWeight: '700' },
  legendMeta: { fontSize: 12, marginTop: 2 },
  emptyState: { textAlign: 'center', fontSize: 14, paddingVertical: 18 },
  statsGrid: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statTile: {
    width: '48%',
    marginBottom: 14,
  },
  statLabel: { fontSize: 12, marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '800' },
});
