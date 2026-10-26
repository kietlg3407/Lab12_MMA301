import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Message,
  PageHeader,
  Screen,
} from '../../src/components/Shared';
import { getProductById } from '../../src/database';
import { COLORS, CATEGORIES } from '../../src/theme';

const emptyForm = {
  product_name: '',
  brand: '',
  category: 'Laptop',
  cpu: '',
  ram: '',
  storage: '',
  price: '',
  stock: '',
  sold_quantity: '',
  is_featured: false,
};

const numericFields = [
  { name: 'ram', label: 'RAM (GB)', placeholder: 'Ví dụ: 16', keyboardType: 'number-pad', icon: 'flash-outline' },
  { name: 'storage', label: 'Ổ cứng (GB)', placeholder: 'Ví dụ: 512', keyboardType: 'number-pad', icon: 'save-outline' },
  { name: 'price', label: 'Giá (USD)', placeholder: 'Ví dụ: 1200', keyboardType: 'decimal-pad', icon: 'pricetag-outline' },
  { name: 'stock', label: 'Tồn kho', placeholder: 'Ví dụ: 8', keyboardType: 'number-pad', icon: 'cube-outline' },
  { name: 'sold_quantity', label: 'Số lượng đã bán', placeholder: 'Ví dụ: 12', keyboardType: 'number-pad', icon: 'bar-chart-outline' },
];


export default function AddComputerScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const editId = Array.isArray(productId) ? productId[0] : productId;
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [success, setSuccess] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError('');
      if (!editId) {
        setForm({ ...emptyForm });
        setLoading(false);
        return () => {
          active = false;
        };
      }

      setLoading(true);
      getProductById(db, editId)
        .then((product) => {
          if (!active) return;
          if (!product) {
            setError('Không tìm thấy sản phẩm cần chỉnh sửa.');
            return;
          }
          setForm({
            product_name: product.product_name,
            brand: product.brand,
            category: product.category,
            cpu: product.cpu,
            ram: String(product.ram),
            storage: String(product.storage),
            price: String(product.price),
            stock: String(product.stock),
            sold_quantity: String(product.sold_quantity),
            is_featured: Boolean(product.is_featured),
          });
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
    }, [db, editId])
  );

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveProduct = async () => {
    setError('');
    const requiredFields = [
      ['product_name', 'Tên sản phẩm'],
      ['brand', 'Hãng'],
      ['category', 'Loại sản phẩm'],
      ['cpu', 'CPU'],
      ['ram', 'RAM'],
      ['storage', 'Ổ cứng'],
      ['price', 'Giá'],
      ['stock', 'Tồn kho'],
      ['sold_quantity', 'Số lượng đã bán'],
    ];
    const missingField = requiredFields.find(([name]) => !String(form[name]).trim());
    if (missingField) {
      setError(`Vui lòng nhập ${missingField[1]}.`);
      return;
    }

    const ram = Number(form.ram);
    const storage = Number(form.storage);
    const price = Number(form.price);
    const stock = Number(form.stock);
    const soldQuantity = Number(form.sold_quantity);
    if (!Number.isInteger(ram) || ram < 4 || ram > 128) {
      setError('RAM phải là số nguyên từ 4 đến 128 GB.');
      return;
    }
    if (!Number.isInteger(storage) || storage < 128 || storage > 4096) {
      setError('Ổ cứng phải là số nguyên từ 128 đến 4096 GB.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError('Giá phải là một số lớn hơn 0.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError('Tồn kho phải là số nguyên không âm.');
      return;
    }
    if (!Number.isInteger(soldQuantity) || soldQuantity < 0) {
      setError('Số lượng đã bán phải là số nguyên không âm.');
      return;
    }

    setSaving(true);
    try {
      const values = [
        form.product_name.trim(),
        form.brand.trim(),
        form.category,
        form.cpu.trim(),
        ram,
        storage,
        price,
        stock,
        soldQuantity,
        form.is_featured ? 1 : 0,
      ];
      if (editId) {
        await db.runAsync(
          `UPDATE products SET
            product_name = ?, brand = ?, category = ?, cpu = ?, ram = ?,
            storage = ?, price = ?, stock = ?, sold_quantity = ?, is_featured = ?
           WHERE id = ?`,
          ...values,
          Number(editId)
        );
      } else {
        await db.runAsync(
          `INSERT INTO products
            (product_name, brand, category, cpu, ram, storage, price, stock, sold_quantity, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ...values
        );
      }

      setSuccess({
        title: editId ? 'Đã cập nhật' : 'Đã thêm sản phẩm',
        message: editId
          ? 'Thông tin sản phẩm đã được lưu.'
          : 'Sản phẩm mới đã được lưu vào SQLite.',
      });
      setForm({ ...emptyForm });
      router.setParams({ productId: undefined });
    } catch (saveError) {
      setError(`Không lưu được sản phẩm: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <PageHeader
        title={editId ? 'Chỉnh sửa máy tính' : 'Thêm máy tính'}
        subtitle={editId ? 'Cập nhật thông tin sản phẩm' : 'Điền thông tin sản phẩm mới'}
        icon="laptop-outline"
      />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? <Message>{error}</Message> : null}
          {loading ? <Text style={styles.loadingText}>Đang tải thông tin sản phẩm...</Text> : null}

          <Field
            label="Tên sản phẩm"
            value={form.product_name}
            onChangeText={(value) => updateField('product_name', value)}
            placeholder="Ví dụ: MacBook Pro M3"
            icon="create-outline"
          />
          <Field
            label="Hãng"
            value={form.brand}
            onChangeText={(value) => updateField('brand', value)}
            placeholder="Ví dụ: Apple"
            icon="pricetags-outline"
          />

          <Text style={styles.label}>Loại sản phẩm</Text>
          <Pressable
            onPress={() => setCategoryOpen(true)}
            style={styles.categoryDropdown}
            accessibilityRole="button"
            accessibilityLabel={`Loại sản phẩm: ${form.category}`}
          >
            <Ionicons name="settings-outline" size={18} color={COLORS.secondaryText} />
            <Text style={styles.categoryValue}>{form.category}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.secondaryText} />
          </Pressable>

          <Field
            label="CPU"
            value={form.cpu}
            onChangeText={(value) => updateField('cpu', value)}
            placeholder="Ví dụ: Intel Core i7"
            icon="hardware-chip-outline"
          />

          <View style={styles.numericGrid}>
            {numericFields.map((item) => (
              <View key={item.name} style={styles.numericField}>
                <Field
                  label={item.label}
                  value={form[item.name]}
                  onChangeText={(value) => updateField(item.name, value)}
                  placeholder={item.placeholder}
                  keyboardType={item.keyboardType}
                  icon={item.icon}
                />
              </View>
            ))}
          </View>

          <View style={styles.featuredRow}>
            <View style={styles.featuredCopy}>
              <Ionicons name={form.is_featured ? 'flame' : 'flame-outline'} size={21} color={COLORS.featured} />
              <View>
                <Text style={styles.featuredTitle}>Sản phẩm nổi bật</Text>
                <Text style={styles.featuredSubtitle}>Đánh dấu để hiển thị ở tab Nổi bật</Text>
              </View>
            </View>
            <Switch
              value={form.is_featured}
              onValueChange={(value) => updateField('is_featured', value)}
              trackColor={{ false: '#CDD3DF', true: '#F4B19A' }}
              thumbColor={form.is_featured ? COLORS.featured : '#F7F8FA'}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={() => {
                router.setParams({ productId: undefined });
                router.replace('/(tabs)');
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.secondaryText} />
              <Text style={styles.cancelText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (pressed || saving || loading) && styles.pressed,
              ]}
              disabled={saving || loading}
              onPress={saveProduct}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveText}>{saving ? 'Đang lưu...' : editId ? 'Cập nhật' : 'Lưu sản phẩm'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCategoryOpen(false)}
            accessibilityLabel="Đóng lựa chọn loại sản phẩm"
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn loại sản phẩm</Text>
            {CATEGORIES.map((item) => (
              <Pressable
                key={item}
                onPress={() => {
                  updateField('category', item);
                  setCategoryOpen(false);
                }}
                style={[styles.modalOption, item === form.category && styles.modalOptionSelected]}
              >
                <Text style={[styles.modalOptionText, item === form.category && styles.modalOptionTextSelected]}>
                  {item}
                </Text>
                {item === form.category ? (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
      <Modal
        visible={Boolean(success)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSuccess(null);
          router.replace('/(tabs)');
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={34} color={COLORS.success} />
            </View>
            <Text style={styles.modalTitle}>{success?.title}</Text>
            <Text style={styles.successMessage}>{success?.message}</Text>
            <Pressable
              onPress={() => {
                setSuccess(null);
                router.replace('/(tabs)');
              }}
              style={styles.modalAction}
            >
              <Text style={styles.modalActionText}>Về cửa hàng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default', icon }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon ? <Ionicons name={icon} size={18} color={COLORS.secondaryText} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA4B5"
          keyboardType={keyboardType}
          style={styles.input}
          autoCapitalize="sentences"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  formContent: { paddingHorizontal: 18, paddingBottom: 24 },
  fieldWrap: { marginBottom: 14 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  inputWrap: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 12 },
  input: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 10 },
  categoryDropdown: { minHeight: 47, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 12, marginBottom: 15 },
  categoryValue: { flex: 1, color: COLORS.text, fontSize: 14 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(17, 25, 43, 0.45)' },
  modalCard: { width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17 },
  modalTitle: { color: COLORS.text, fontSize: 17, fontWeight: '800', marginBottom: 10 },
  modalOption: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 11, borderRadius: 11 },
  modalOptionSelected: { backgroundColor: '#E9EDFF' },
  modalOptionText: { color: COLORS.text, fontSize: 14 },
  modalOptionTextSelected: { color: COLORS.primary, fontWeight: '800' },
  successIcon: { alignSelf: 'center', marginBottom: 9 },
  successMessage: { color: COLORS.secondaryText, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 16 },
  modalAction: { minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: COLORS.primary },
  modalActionText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  numericGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  numericField: { width: '48%' },
  featuredRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 13, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, marginTop: 2, marginBottom: 18 },
  featuredCopy: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  featuredTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  featuredSubtitle: { color: COLORS.secondaryText, fontSize: 11, marginTop: 3 },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  cancelButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 13, borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#FFFFFF' },
  cancelText: { color: COLORS.secondaryText, fontSize: 14, fontWeight: '700' },
  saveButton: { flex: 2, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 13, backgroundColor: COLORS.primary },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.75 },
  loadingText: { color: COLORS.secondaryText, textAlign: 'center', marginBottom: 12 },
});
