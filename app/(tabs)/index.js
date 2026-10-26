import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EmptyState, Message, PageHeader, ProductCard, Screen } from '../../src/components/Shared';
import { getProducts } from '../../src/database';
import { COLORS, CATEGORIES } from '../../src/theme';

const STOCK_FILTERS = [
  ['all', 'Tất cả'],
  ['in', 'Còn hàng'],
  ['low', 'Sắp hết (<5)'],
  ['out', 'Hết hàng'],
];
const RAM_FILTERS = [
  ['all', 'Mọi RAM'],
  ['8', '8 GB'],
  ['16', '16 GB'],
  ['32', '32 GB+'],
];
const PRICE_FILTERS = [
  ['all', 'Mọi giá'],
  ['under500', '< $500'],
  ['500to1000', '$500–1.000'],
  ['over1000', '> $1.000'],
];
const SORT_OPTIONS = [
  ['name', 'Tên A–Z'],
  ['priceAsc', 'Giá ↑'],
  ['priceDesc', 'Giá ↓'],
  ['soldAsc', 'Đã bán ↑'],
  ['soldDesc', 'Đã bán ↓'],
];

export default function StoreScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [stock, setStock] = useState('all');
  const [ram, setRam] = useState('all');
  const [price, setPrice] = useState('all');
  const [sort, setSort] = useState('name');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setError('');
      setProducts(await getProducts(db));
    } catch (loadError) {
      setError(`Không tải được sản phẩm: ${loadError.message}`);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      if (!product.product_name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (brand !== 'all' && product.brand !== brand) return false;
      if (category !== 'all' && product.category !== category) return false;
      if (featuredOnly && !product.is_featured) return false;
      if (stock === 'in' && product.stock <= 0) return false;
      if (stock === 'low' && product.stock >= 5) return false;
      if (stock === 'out' && product.stock !== 0) return false;
      if (ram === '8' && product.ram !== 8) return false;
      if (ram === '16' && product.ram !== 16) return false;
      if (ram === '32' && product.ram < 32) return false;
      if (price === 'under500' && product.price >= 500) return false;
      if (price === '500to1000' && (product.price < 500 || product.price > 1000)) return false;
      if (price === 'over1000' && product.price <= 1000) return false;
      return true;
    });

    const sorters = {
      name: (a, b) => a.product_name.localeCompare(b.product_name),
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      soldAsc: (a, b) => a.sold_quantity - b.sold_quantity,
      soldDesc: (a, b) => b.sold_quantity - a.sold_quantity,
    };
    return result.sort(sorters[sort]);
  }, [products, search, brand, category, featuredOnly, stock, ram, price, sort]);

  const resetFilters = () => {
    setSearch('');
    setBrand('all');
    setCategory('all');
    setFeaturedOnly(false);
    setStock('all');
    setRam('all');
    setPrice('all');
    setSort('name');
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  return (
    <Screen>
      <PageHeader title="Cửa hàng" subtitle={`${products.length} sản phẩm trong kho`} />
      {error ? <Message>{error}</Message> : null}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/product/${item.id}`)}
          />
        )}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <View style={styles.filters}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={19} color={COLORS.secondaryText} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Tìm theo tên sản phẩm..."
                placeholderTextColor="#98A1B2"
                style={styles.searchInput}
                returnKeyType="search"
              />
              {!!search && (
                <Pressable onPress={() => setSearch('')} accessibilityLabel="Xóa tìm kiếm">
                  <Ionicons name="close-circle" size={19} color="#98A1B2" />
                </Pressable>
              )}
            </View>

            <FilterRow title="Hãng" options={['all', ...brands]} value={brand} onChange={setBrand} allLabel="Tất cả" />
            <FilterRow title="Loại" options={['all', ...CATEGORIES]} value={category} onChange={setCategory} allLabel="Tất cả" />
            <FilterRow title="Tình trạng kho" options={STOCK_FILTERS.map(([value]) => value)} labels={Object.fromEntries(STOCK_FILTERS)} value={stock} onChange={setStock} />
            <FilterRow title="RAM" options={RAM_FILTERS.map(([value]) => value)} labels={Object.fromEntries(RAM_FILTERS)} value={ram} onChange={setRam} />
            <FilterRow title="Giá" options={PRICE_FILTERS.map(([value]) => value)} labels={Object.fromEntries(PRICE_FILTERS)} value={price} onChange={setPrice} />
            <FilterRow title="Sắp xếp" options={SORT_OPTIONS.map(([value]) => value)} labels={Object.fromEntries(SORT_OPTIONS)} value={sort} onChange={setSort} />
            <View style={styles.filterBottom}>
              <View style={styles.featuredFilter}>
                <Ionicons name={featuredOnly ? 'flame' : 'flame-outline'} size={19} color={COLORS.featured} />
                <Text style={styles.filterCaption}>Chỉ sản phẩm nổi bật</Text>
                <Switch
                  value={featuredOnly}
                  onValueChange={setFeaturedOnly}
                  trackColor={{ false: '#CDD3DF', true: '#F4B19A' }}
                  thumbColor={featuredOnly ? COLORS.featured : '#F7F8FA'}
                  accessibilityLabel="Lọc sản phẩm nổi bật"
                />
              </View>
              <Pressable onPress={resetFilters} style={styles.resetButton}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                <Text style={styles.resetText}>Đặt lại</Text>
              </Pressable>
            </View>
            <Text style={styles.resultText}>Hiển thị {filteredProducts.length} sản phẩm</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={products.length ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm'}
            subtitle={products.length ? 'Thử thay đổi bộ lọc hoặc đặt lại.' : 'Thêm sản phẩm đầu tiên bằng tab Thêm máy.'}
            icon="laptop-outline"
          />
        }
        contentContainerStyle={styles.listContent}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/(tabs)/add')}
        accessibilityRole="button"
        accessibilityLabel="Thêm máy tính"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

function FilterRow({ title, options, labels, value, onChange, allLabel }) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterCaption}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.map((option) => {
          const label = labels ? labels[option] : option === 'all' ? allLabel : option;
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { paddingHorizontal: 16, paddingBottom: 8 },
  searchBox: { minHeight: 48, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 9 },
  filterRow: { marginTop: 5 },
  filterCaption: { color: COLORS.secondaryText, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  chips: { gap: 7, paddingBottom: 2 },
  chip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 11 },
  chipSelected: { backgroundColor: '#EDE7F6', borderColor: COLORS.primary },
  chipText: { color: COLORS.secondaryText, fontSize: 11, fontWeight: '600' },
  chipTextSelected: { color: COLORS.primary, fontWeight: '800' },
  filterBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  featuredFilter: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  resetButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 7 },
  resetText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  resultText: { color: COLORS.secondaryText, fontSize: 12, marginTop: 4, marginBottom: 4 },
  listContent: { paddingBottom: 86, flexGrow: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
