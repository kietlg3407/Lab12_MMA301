import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  CategoryDistributionBar,
  EmptyState,
  LoadingState,
  Message,
  PageHeader,
  Screen,
  SectionTitle,
  StatCard,
} from '../../src/components/Shared';
import { getStatistics } from '../../src/database';
import { CATEGORIES, COLORS, formatCurrency, formatInteger } from '../../src/theme';

const CATEGORY_ICONS = {
  Laptop: 'laptop-outline',
  Desktop: 'desktop-outline',
  Component: 'hardware-chip-outline',
};

export default function StatisticsScreen() {
  const db = useSQLiteContext();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError('');
      getStatistics(db)
        .then((result) => {
          if (active) setStatistics(result);
        })
        .catch((loadError) => {
          if (active) setError(`Không tải được thống kê: ${loadError.message}`);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [db])
  );

  if (loading) {
    return (
      <Screen>
        <PageHeader title="Thống kê" subtitle="Tình hình kinh doanh" icon="analytics-outline" />
        <LoadingState />
      </Screen>
    );
  }

  if (!statistics) {
    return (
      <Screen>
        <PageHeader title="Thống kê" subtitle="Tình hình kinh doanh" icon="analytics-outline" />
        {error ? <Message>{error}</Message> : <EmptyState title="Chưa có dữ liệu thống kê" />}
      </Screen>
    );
  }

  const { totals, categories, bestSeller, topBrand, lowStock } = statistics;
  const categoryMap = Object.fromEntries(categories.map((item) => [item.category, item]));

  return (
    <Screen>
      <PageHeader title="Thống kê" subtitle="Tình hình kinh doanh" icon="analytics-outline" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? <Message>{error}</Message> : null}
        <View style={styles.statGrid}>
          <StatCard icon="cube-outline" label="Tổng sản phẩm" value={formatInteger(totals.total_products)} />
          <StatCard icon="cash-outline" label="Tổng doanh thu" value={formatCurrency(totals.revenue)} accent={COLORS.success} />
          <StatCard icon="bar-chart" label="Tổng đã bán" value={formatInteger(totals.total_sold)} accent={COLORS.featured} />
          <StatCard icon="calculator-outline" label="Giá trung bình" value={formatCurrency(totals.average_price)} accent={COLORS.gold} />
        </View>

        <SectionTitle style={styles.sectionHeading}>Phân bổ loại sản phẩm (Biểu đồ)</SectionTitle>
        <Card>
          <CategoryDistributionBar categories={categories} totalCount={totals.total_products} />
          {CATEGORIES.map((category, index) => {
            const item = categoryMap[category] || { product_count: 0, sold_quantity: 0 };
            return (
              <View key={category} style={[styles.categoryRow, index === CATEGORIES.length - 1 && styles.lastRow]}>
                <View style={styles.categoryName}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name={CATEGORY_ICONS[category]} size={18} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={styles.rowTitle}>{category}</Text>
                    <Text style={styles.rowSubtitle}>{formatInteger(item.sold_quantity)} đã bán</Text>
                  </View>
                </View>
                <Text style={styles.rowValue}>{formatInteger(item.product_count)} sản phẩm</Text>
              </View>
            );
          })}
        </Card>

        <SectionTitle style={styles.sectionHeading}>Điểm nổi bật</SectionTitle>
        <View style={styles.highlights}>
          <Card style={styles.highlightCard}>
            <View style={styles.cardHeaderWithIcon}>
              <Ionicons name="trophy-outline" size={24} color={COLORS.gold} />
              <Text style={styles.highlightLabel}>Bán chạy nhất</Text>
            </View>
            {bestSeller ? (
              <>
                <Text style={styles.highlightTitle}>{bestSeller.product_name}</Text>
                <Text style={styles.highlightDetail}>{bestSeller.brand} · {formatInteger(bestSeller.sold_quantity)} đã bán</Text>
              </>
            ) : <Text style={styles.highlightDetail}>Chưa có dữ liệu</Text>}
          </Card>
          <Card style={styles.highlightCard}>
            <View style={styles.cardHeaderWithIcon}>
              <Ionicons name="business-outline" size={24} color={COLORS.primary} />
              <Text style={styles.highlightLabel}>Top Brand</Text>
            </View>
            {topBrand ? (
              <>
                <Text style={styles.highlightTitle}>{topBrand.brand}</Text>
                <Text style={styles.highlightDetail}>{formatInteger(topBrand.sold_quantity)} máy đã bán</Text>
              </>
            ) : <Text style={styles.highlightDetail}>Chưa có dữ liệu</Text>}
          </Card>
        </View>

        <View style={styles.headingWithIcon}>
          <Ionicons name="alert-circle-outline" size={22} color={COLORS.warning} />
          <SectionTitle style={styles.sectionHeadingInline}>Sắp hết hàng (dưới 5 sản phẩm)</SectionTitle>
        </View>
        <Card>
          {lowStock.length === 0 ? (
            <Text style={styles.emptyLowStock}>Tất cả sản phẩm đều còn đủ hàng.</Text>
          ) : lowStock.map((item, index) => (
            <View key={item.id} style={[styles.lowStockRow, index === lowStock.length - 1 && styles.lastRow]}>
              <View style={styles.lowStockName}>
                <Text style={styles.rowTitle}>{item.product_name}</Text>
                <Text style={styles.rowSubtitle}>{item.brand}</Text>
              </View>
              <Text style={[styles.stockValue, item.stock === 0 && styles.outOfStock]}>
                {item.stock === 0 ? 'Hết hàng' : `${formatInteger(item.stock)} còn lại`}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sectionHeading: { marginTop: 20, marginBottom: 10 },
  categoryRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  categoryName: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8EDFF', borderRadius: 11 },
  rowTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  rowSubtitle: { color: COLORS.secondaryText, fontSize: 11, marginTop: 3 },
  rowValue: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  lastRow: { borderBottomWidth: 0 },
  highlights: { flexDirection: 'row', gap: 10 },
  highlightCard: { flex: 1, padding: 13 },
  highlightLabel: { color: COLORS.secondaryText, fontSize: 11, fontWeight: '700' },
  highlightTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginTop: 8 },
  highlightDetail: { color: COLORS.secondaryText, fontSize: 11, lineHeight: 17, marginTop: 4 },
  lowStockRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  lowStockName: { flex: 1 },
  stockValue: { color: COLORS.warning, fontSize: 12, fontWeight: '700' },
  outOfStock: { color: COLORS.danger },
  emptyLowStock: { color: COLORS.secondaryText, textAlign: 'center', paddingVertical: 12, fontSize: 13 },
  cardHeaderWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  headingWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, marginBottom: 10 },
  sectionHeadingInline: { marginBottom: 0 },
});

