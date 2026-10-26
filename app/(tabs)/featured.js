import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  CategoryDistributionBar,
  EmptyState,
  LoadingState,
  Message,
  PageHeader,
  ProductCard,
  Screen,
  SectionTitle,
  StatCard,
} from '../../src/components/Shared';
import { getFeaturedStatistics, getProducts } from '../../src/database';
import { CATEGORIES, COLORS, formatCurrency, formatInteger } from '../../src/theme';


export default function FeaturedScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError('');
      Promise.all([getProducts(db), getFeaturedStatistics(db)])
        .then(([allProducts, result]) => {
          if (active) {
            setProducts(allProducts.filter((product) => product.is_featured));
            setStatistics(result);
          }
        })
        .catch((loadError) => {
          if (active) setError(`Không tải được sản phẩm nổi bật: ${loadError.message}`);
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
        <PageHeader title="Sản phẩm nổi bật" subtitle="Các lựa chọn được đánh dấu" icon="flame" />
        <LoadingState />
      </Screen>
    );
  }

  const categoryMap = Object.fromEntries(
    (statistics?.categories || []).map((item) => [item.category, item])
  );

  return (
    <Screen>
      <PageHeader title="Sản phẩm nổi bật" subtitle="Các lựa chọn được đánh dấu" icon="flame" />
      {error ? <Message>{error}</Message> : null}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            compact
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
        ListHeaderComponent={
          statistics ? (
            <View style={styles.summary}>
              <View style={styles.statGrid}>
                <StatCard icon="star" label="Tổng nổi bật" value={formatInteger(statistics.totals.total_featured)} accent={COLORS.gold} />
                <StatCard icon="cash" label="Doanh thu" value={formatCurrency(statistics.totals.revenue)} accent={COLORS.success} />
                <StatCard icon="stats-chart" label="Đã bán" value={formatInteger(statistics.totals.total_sold)} accent={COLORS.primary} />
              </View>
              <View style={styles.headingWithIcon}>
                <Ionicons name="grid-outline" size={20} color={COLORS.primary} />
                <SectionTitle style={styles.sectionTitleInline}>Theo loại sản phẩm</SectionTitle>
              </View>
              <Card>
                <CategoryDistributionBar categories={statistics.categories || []} totalCount={statistics.totals.total_featured} />
                {CATEGORIES.map((category, index) => {
                  const item = categoryMap[category] || { product_count: 0, sold_quantity: 0 };
                  return (
                    <View key={category} style={[styles.categoryRow, index === CATEGORIES.length - 1 && styles.lastRow]}>
                      <Text style={styles.categoryName}>{category}</Text>
                      <Text style={styles.categoryValue}>
                        {formatInteger(item.product_count)} máy · {formatInteger(item.sold_quantity)} đã bán
                      </Text>
                    </View>
                  );
                })}
              </Card>
              <SectionTitle style={styles.listTitle}>Danh sách sản phẩm</SectionTitle>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title="Chưa có sản phẩm nổi bật"
            subtitle="Bật công tắc Sản phẩm nổi bật trong biểu mẫu thêm hoặc sửa."
            icon="flame-outline"
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { paddingHorizontal: 16, paddingBottom: 8 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  sectionTitle: { marginTop: 19, marginBottom: 9 },
  listTitle: { marginTop: 20, marginBottom: 9 },
  categoryRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 8 },
  categoryName: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  categoryValue: { color: COLORS.secondaryText, fontSize: 11, textAlign: 'right' },
  lastRow: { borderBottomWidth: 0 },
  listContent: { paddingBottom: 20, flexGrow: 1 },
  headingWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 19, marginBottom: 9 },
  sectionTitleInline: { marginBottom: 0 },
});

