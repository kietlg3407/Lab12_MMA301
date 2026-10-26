import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Card,
  EmptyState,
  InfoRow,
  LoadingState,
  Message,
  Screen,
  SectionTitle,
} from '../../src/components/Shared';
import { getProductById } from '../../src/database';
import { COLORS, formatCurrency, formatInteger } from '../../src/theme';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setError('');
      getProductById(db, id)
        .then((result) => {
          if (active) setProduct(result);
        })
        .catch((loadError) => {
          if (active) setError(`Không tải được sản phẩm: ${loadError.message}`);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [db, id])
  );

  const deleteProduct = async () => {
    setDeleting(true);
    setError('');
    try {
      await db.runAsync('DELETE FROM products WHERE id = ?', Number(id));
      setConfirmDelete(false);
      router.replace('/(tabs)');
    } catch (deleteError) {
      setError(`Không xóa được sản phẩm: ${deleteError.message}`);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <View style={styles.backOnly}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={21} color={COLORS.text} />
            <Text style={styles.backText}>Quay lại</Text>
          </Pressable>
        </View>
        {error ? <Message>{error}</Message> : <EmptyState title="Không tìm thấy sản phẩm" />}
      </Screen>
    );
  }

  const revenue = product.price * product.sold_quantity;
  const inventoryValue = product.price * product.stock;
  const totalUnits = product.stock + product.sold_quantity;

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={21} color={COLORS.text} />
          <Text style={styles.backText}>Quay lại</Text>
        </Pressable>
        {product.is_featured ? (
          <View style={styles.featuredBadge}>
            <Ionicons name="flame" size={15} color={COLORS.featured} />
            <Text style={styles.featuredText}>Nổi bật</Text>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {error ? <Message>{error}</Message> : null}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="desktop-outline" size={46} color={COLORS.primary} />
          </View>
          <Text style={styles.name}>{product.product_name}</Text>
          <Text style={styles.subtitle}>{product.brand} · {product.category}</Text>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        </View>

        <Card style={styles.sectionCard}>
          <SectionTitle>Thông tin sản phẩm</SectionTitle>
          <InfoRow icon="pricetag-outline" label="Mã sản phẩm" value={String(product.id)} />
          <InfoRow icon="business-outline" label="Hãng" value={product.brand} />
          <InfoRow icon="folder-outline" label="Loại" value={product.category} />
          <InfoRow icon="hardware-chip" label="CPU" value={product.cpu} />
          <InfoRow icon="flash-outline" label="RAM" value={`${formatInteger(product.ram)} GB`} />
          <InfoRow icon="server-outline" label="Ổ cứng" value={`${formatInteger(product.storage)} GB`} />
          <InfoRow icon="cube-outline" label="Tồn kho" value={formatInteger(product.stock)} />
          <InfoRow icon="bar-chart-outline" label="Đã bán" value={formatInteger(product.sold_quantity)} />
        </Card>

        <Card style={styles.sectionCard}>
          <SectionTitle>Giá trị kinh doanh</SectionTitle>
          <InfoRow icon="stats-chart-outline" label="Doanh thu" value={formatCurrency(revenue)} />
          <InfoRow icon="cube" label="Giá trị tồn kho" value={formatCurrency(inventoryValue)} />
          <InfoRow icon="add-circle-outline" label="Tổng số máy" value={formatInteger(totalUnits)} />
        </Card>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
            onPress={() => router.push({ pathname: '/(tabs)/add', params: { productId: String(product.id) } })}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
            onPress={() => setConfirmDelete(true)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={styles.deleteText}>Xóa</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        visible={confirmDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmDelete(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.deleteIcon}>
              <Ionicons name="trash-outline" size={27} color={COLORS.danger} />
            </View>
            <Text style={styles.confirmTitle}>Xóa sản phẩm</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete this product?
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                disabled={deleting}
                onPress={() => setConfirmDelete(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={deleting}
                onPress={deleteProduct}
                style={[styles.confirmDeleteButton, deleting && styles.pressed]}
              >
                <Text style={styles.confirmDeleteText}>{deleting ? 'Đang xóa...' : 'Xóa'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10 },
  backOnly: { paddingHorizontal: 18, paddingVertical: 10 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7 },
  backText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF0EA', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 7 },
  featuredText: { color: COLORS.featured, fontWeight: '700', fontSize: 12 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  hero: { alignItems: 'center', paddingVertical: 15 },
  heroIcon: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#EDE7F6', marginBottom: 12 },
  name: { color: COLORS.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.secondaryText, fontSize: 14, marginTop: 5 },
  price: { color: COLORS.primary, fontSize: 24, fontWeight: '800', marginTop: 9 },
  sectionCard: { marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  editButton: { flex: 1, height: 49, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, borderRadius: 13, backgroundColor: COLORS.primary },
  editText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  deleteButton: { width: 105, height: 49, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, borderRadius: 13, backgroundColor: '#FDECEE' },
  deleteText: { color: COLORS.danger, fontWeight: '800', fontSize: 14 },
  pressed: { opacity: 0.76 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(17, 25, 43, 0.45)' },
  confirmCard: { width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 19 },
  deleteIcon: { alignSelf: 'center', width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#FDECEE', marginBottom: 11 },
  confirmTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  confirmMessage: { color: COLORS.secondaryText, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  confirmActions: { flexDirection: 'row', gap: 9 },
  cancelButton: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  cancelText: { color: COLORS.secondaryText, fontWeight: '700', fontSize: 14 },
  confirmDeleteButton: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: COLORS.danger },
  confirmDeleteText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
});
