// app/screens/StatisticsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { getTransactions, Transaction } from '../storage/wallet';
import { DEFAULT_SETTINGS, getSettings } from '../storage/settings';

const { width } = Dimensions.get('window');

const C = {
  bg: '#0F0F1E',
  card: '#1A1A2E',
  track: '#2A2A3E',
  accent: '#6C63FF',
  green: '#4CAF50',
  red: '#FF6B6B',
  orange: '#FF9800',
  text: '#FFFFFF',
  sub: '#A0A0B0',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMonthTxns(txns: Transaction[], month: Date) {
  return txns.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === month.getMonth() &&
      d.getFullYear() === month.getFullYear()
    );
  });
}

/** Bucket expenses into 5 weekly slots for the month */
function buildWeeklyExpenses(txns: Transaction[]): number[] {
  const weeks = [0, 0, 0, 0, 0];
  txns
    .filter((t) => t.type !== 'deposit')
    .forEach((t) => {
      const day = new Date(t.date).getDate();
      const idx = Math.min(Math.floor((day - 1) / 7), 4);
      weeks[idx] += t.amount;
    });
  return weeks;
}

function fmt(n: number) {
  return n.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SummaryCard({
  label,
  amount,
  color,
  symbol,
}: {
  label: string;
  amount: number;
  color: string;
  symbol: string;
}) {
  return (
    <View style={[s.summaryCard, { borderLeftColor: color }]}> 
      <Text style={s.summaryLabel}>{label}</Text>
      <Text style={[s.summaryAmount, { color }]}>{symbol}{fmt(amount)}</Text>
    </View>
  );
}

function CategoryBar({
  label,
  amount,
  total,
  color,
  symbol,
}: {
  label: string;
  amount: number;
  total: number;
  color: string;
  symbol: string;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={s.categoryItem}>
      <View style={s.categoryHeader}>
        <Text style={s.categoryLabel}>{label}</Text>
        <Text style={[s.categoryPct, { color }]}> 
          {symbol}{fmt(amount)}  {pct.toFixed(0)}%
        </Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={s.pill}>
      <Text style={[s.pillValue, { color }]}>{value}</Text>
      <Text style={s.pillLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StatisticsScreen() {
  const [allTxns, setAllTxns] = useState<Transaction[]>([]);
  const [month, setMonth] = useState(new Date());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const txns = await getTransactions();
        const savedSettings = await getSettings();
        setAllTxns(txns);
        setSettings(savedSettings);
      };
      load();
    }, [])
  );

  const txns = getMonthTxns(allTxns, month);

  const totalDeposit = txns
    .filter((t) => t.type === 'deposit')
    .reduce((s, t) => s + t.amount, 0);
  const totalSpend = txns
    .filter((t) => t.type === 'spend')
    .reduce((s, t) => s + t.amount, 0);
  const totalShopping = txns
    .filter((t) => t.type === 'shopping')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = totalSpend + totalShopping;
  const net = totalDeposit - totalExpense;

  const weeklyData = buildWeeklyExpenses(txns);
  const hasChartData = weeklyData.some((v) => v > 0);

  const prevMonth = () => {
    const d = new Date(month);
    d.setMonth(d.getMonth() - 1);
    setMonth(d);
  };

  const nextMonth = () => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + 1);
    const now = new Date();
    // don't go into the future
    if (d.getFullYear() < now.getFullYear() ||
        (d.getFullYear() === now.getFullYear() && d.getMonth() <= now.getMonth())) {
      setMonth(d);
    }
  };

  const monthLabel = month.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* ── Month Selector ── */}
      <View style={s.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={s.monthBtn}>
          <Text style={s.monthArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={s.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.monthBtn}>
          <Text style={s.monthArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Top Summary Cards ── */}
      <View style={s.row}>
        <SummaryCard label="Deposited" amount={totalDeposit} color={C.green} symbol={settings.currencySymbol} />
        <SummaryCard label="Spent" amount={totalExpense} color={C.red} symbol={settings.currencySymbol} />
      </View>

      {/* ── Net Card ── */}
      <View style={s.netCard}>
        <View>
          <Text style={s.netCardTitle}>Net This Month</Text>
          <Text style={s.netCardSub}>Deposit minus all expenses</Text>
        </View>
        <Text style={[s.netAmount, { color: net >= 0 ? C.green : C.red }]}>
          {net >= 0 ? '+' : ''}{settings.currencySymbol}{fmt(net)}
        </Text>
      </View>

      {/* ── Weekly Bar Chart ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Weekly Spending</Text>
        {hasChartData ? (
          <BarChart
            data={{
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
              datasets: [{ data: weeklyData }],
            }}
            width={width - 48}
            height={190}
            yAxisLabel=""
            yAxisSuffix=""
            showValuesOnTopOfBars
            fromZero
            chartConfig={{
              backgroundColor: C.card,
              backgroundGradientFrom: C.card,
              backgroundGradientTo: C.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
              labelColor: () => C.sub,
              barPercentage: 0.55,
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: C.track,
                strokeWidth: 1,
              },
            }}
            style={{ borderRadius: 10, marginTop: 8, marginLeft: -12 }}
          />
        ) : (
          <Text style={s.empty}>No spending recorded this month</Text>
        )}
      </View>

      {/* ── Expense Breakdown ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Expense Breakdown</Text>
        {totalExpense > 0 ? (
          <>
            <CategoryBar
              label="Quick Spend"
              amount={totalSpend}
              total={totalExpense}
              color={C.red}
              symbol={settings.currencySymbol}
            />
            <CategoryBar
              label="Shopping"
              amount={totalShopping}
              total={totalExpense}
              color={C.orange}
              symbol={settings.currencySymbol}
            />
          </>
        ) : (
          <Text style={s.empty}>No expenses this month</Text>
        )}
      </View>

      {/* ── Transaction Count ── */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Transaction Activity</Text>
        <View style={s.pillRow}>
          <StatPill
            label="Deposits"
            value={txns.filter((t) => t.type === 'deposit').length}
            color={C.green}
          />
          <StatPill
            label="Spends"
            value={txns.filter((t) => t.type === 'spend').length}
            color={C.red}
          />
          <StatPill
            label="Shopping"
            value={txns.filter((t) => t.type === 'shopping').length}
            color={C.orange}
          />
        </View>
      </View>

    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 40 },

  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthBtn: {
    width: 40, height: 40,
    backgroundColor: C.card,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrow: { color: C.text, fontSize: 26, lineHeight: 30 },
  monthLabel: { color: C.text, fontSize: 18, fontWeight: '700' },

  row: { flexDirection: 'row', marginBottom: 12 },
  rowGap: { marginRight: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
  },
  summaryLabel: { color: C.sub, fontSize: 12, marginBottom: 6 },
  summaryAmount: { fontSize: 18, fontWeight: '700' },

  netCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netCardTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  netCardSub: { color: C.sub, fontSize: 12, marginTop: 2 },
  netAmount: { fontSize: 22, fontWeight: '800' },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  empty: { color: C.sub, textAlign: 'center', paddingVertical: 20, fontSize: 14 },

  categoryItem: { marginTop: 12 },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryLabel: { color: C.text, fontSize: 14 },
  categoryPct: { fontSize: 13, fontWeight: '600' },
  barTrack: {
    height: 8,
    backgroundColor: C.track,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },

  pillRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  pill: { alignItems: 'center', paddingVertical: 8 },
  pillValue: { fontSize: 32, fontWeight: '800' },
  pillLabel: { color: C.sub, fontSize: 12, marginTop: 2 },
});