import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, formatCurrency, formatInteger } from '../theme';

export function Screen({ children, style }) {
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>
      {children}
    </SafeAreaView>
  );
}

export function PageHeader({ title, subtitle, icon = 'laptop-outline' }) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.headerIcon}>
        <Ionicons name={icon} size={25} color={COLORS.primary} />
      </View>
      <View style={styles.headerCopy}>
        <Text style={styles.pageTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function Message({ children, type = 'error' }) {
  return (
    <View style={[styles.message, type === 'success' ? styles.successMessage : null]}>
      <Ionicons
        name={type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
        size={18}
        color={type === 'success' ? COLORS.success : COLORS.danger}
      />
      <Text style={[styles.messageText, type === 'success' ? styles.successText : null]}>
        {children}
      </Text>
    </View>
  );
}

export function LoadingState({ label = 'Đang tải dữ liệu...' }) {
  return (
    <View style={styles.centerState}>
      <ActivityIndicator color={COLORS.primary} size="large" />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle, icon = 'laptop-outline' }) {
  return (
    <View style={styles.centerState}>
      <Ionicons name={icon} size={80} color="#B0B7C6" />
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.stateText}>{subtitle}</Text>}
    </View>
  );
}

export function ProductCard({ product, onPress, compact = false }) {
  const stockColor =
    product.stock === 0
      ? COLORS.danger
      : product.stock < 5
        ? COLORS.warning
        : COLORS.success;
  const stockIcon =
    product.stock === 0
      ? 'close-circle'
      : product.stock < 5
        ? 'alert-circle'
        : 'checkmark-circle';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.product_name}, ${product.category}`}
      onPress={onPress}
      style={({ pressed }) => [styles.productCard, pressed && styles.pressed]}
    >
      <View style={styles.productTop}>
        <View style={styles.productTitleWrap}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.productBrand}>{product.brand} · {product.category}</Text>
        </View>
        <Ionicons
          name={product.is_featured ? 'flame' : 'flame-outline'}
          size={20}
          color={product.is_featured ? COLORS.featured : '#B0B7C6'}
        />
        <Ionicons name="chevron-forward" size={18} color="#9AA4B5" />
      </View>

      <View style={styles.productInfoRow}>
        <Info icon="hardware-chip-outline" label={product.cpu || 'Chưa có CPU'} />
        <Info icon="flash-outline" label={`RAM ${formatInteger(product.ram)} GB`} />
        {!compact && (
          <Info icon="save-outline" label={`${formatInteger(product.storage)} GB`} />
        )}
      </View>

      <View style={styles.productBottom}>
        <View style={styles.priceWrap}>
          <Ionicons name="pricetag-outline" size={18} color={COLORS.primary} />
          <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
        </View>
        <View style={styles.stockAndSold}>
          <Ionicons name={stockIcon} size={18} color={stockColor} />
          <Text style={[styles.stockText, { color: stockColor }]}>
            Kho {formatInteger(product.stock)}
          </Text>
          <Text style={styles.dotSeparator}>·</Text>
          <Ionicons name="bar-chart-outline" size={16} color={COLORS.secondaryText} />
          <Text style={styles.soldText}>{formatInteger(product.sold_quantity)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function StatCard({ icon, label, value, detail, accent = COLORS.primary }) {
  return (
    <Card style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={24} color={accent} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {!!detail && <Text style={styles.statDetail}>{detail}</Text>}
    </Card>
  );
}

export function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Ionicons name={icon} size={20} color={COLORS.secondaryText} />
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Info({ icon, label }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color={COLORS.secondaryText} />
      <Text numberOfLines={1} style={styles.infoItemText}>{label}</Text>
    </View>
  );
}

export function CategoryDistributionBar({ categories, totalCount }) {
  const categoryColors = {
    Laptop: '#6200EE',
    Desktop: '#03DAC6',
    Component: '#FF9800',
  };

  const safeTotal = totalCount > 0 ? totalCount : 1;

  return (
    <View style={styles.distributionWrap}>
      <View style={styles.progressBar}>
        {categories.map((item) => {
          const count = item.product_count || 0;
          const pct = Math.max(0, (count / safeTotal) * 100);
          if (pct === 0) return null;
          return (
            <View
              key={item.category}
              style={[
                styles.progressSegment,
                {
                  flex: count,
                  backgroundColor: categoryColors[item.category] || COLORS.primary,
                },
              ]}
            />
          );
        })}
      </View>
      <View style={styles.legendRow}>
        {categories.map((item) => {
          const count = item.product_count || 0;
          const pct = Math.round((count / safeTotal) * 100);
          return (
            <View key={item.category} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: categoryColors[item.category] || COLORS.primary },
                ]}
              />
              <Text style={styles.legendLabel}>
                {item.category}: {pct}% ({count})
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  pageHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 15 },
  headerIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: '#EDE7F6', alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, marginLeft: 12 },
  pageTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  pageSubtitle: { color: COLORS.secondaryText, fontSize: 13, marginTop: 3 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#FDECEE', borderRadius: 12, marginBottom: 12 },
  successMessage: { backgroundColor: '#E8F6EE' },
  messageText: { flex: 1, color: COLORS.danger, fontSize: 13, lineHeight: 19 },
  successText: { color: COLORS.success },
  centerState: { minHeight: 220, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  stateText: { color: COLORS.secondaryText, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  emptyTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  productCard: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 15, marginHorizontal: 16, marginBottom: 11, borderWidth: 1, borderColor: COLORS.border },
  pressed: { opacity: 0.82 },
  productTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productTitleWrap: { flex: 1 },
  productName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  productBrand: { color: COLORS.secondaryText, fontSize: 12, marginTop: 4 },
  productInfoRow: { flexDirection: 'row', gap: 12, marginTop: 13 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5, flexShrink: 1 },
  infoItemText: { color: COLORS.secondaryText, fontSize: 12, flexShrink: 1 },
  productBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 8 },
  priceWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  productPrice: { color: COLORS.primary, fontWeight: '800', fontSize: 17 },
  stockAndSold: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  stockText: { fontSize: 12, fontWeight: '700' },
  dotSeparator: { color: COLORS.secondaryText, marginHorizontal: 2 },
  soldText: { color: COLORS.secondaryText, fontSize: 12, fontWeight: '600' },
  statCard: { flex: 1, minWidth: '46%', padding: 14 },
  statIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statLabel: { color: COLORS.secondaryText, fontSize: 12, fontWeight: '600' },
  statValue: { color: COLORS.text, fontSize: 19, fontWeight: '800', marginTop: 5 },
  statDetail: { color: COLORS.secondaryText, fontSize: 11, marginTop: 4 },
  infoRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 10 },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  infoLabelText: { color: COLORS.secondaryText, fontSize: 14 },
  infoValue: { color: COLORS.text, fontWeight: '600', fontSize: 14, textAlign: 'right', flexShrink: 1 },
  distributionWrap: { marginVertical: 8 },
  progressBar: { height: 14, flexDirection: 'row', borderRadius: 7, overflow: 'hidden', backgroundColor: '#EDE7F6' },
  progressSegment: { height: '100%' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { color: COLORS.secondaryText, fontSize: 11, fontWeight: '600' },
});
