# Computer Store Manager

Ứng dụng quản lý cửa hàng máy tính viết bằng JavaScript, React Native và Expo SDK 57. Dữ liệu sản phẩm được lưu trên thiết bị bằng SQLite.

## Chạy ứng dụng

1. Cài Node.js LTS.
2. Mở Terminal tại thư mục `ComputerStoreManager`.
3. Cài các thư viện và khởi động Expo:

   ```bash
   npm install
   npx expo start
   ```

4. Quét mã QR bằng ứng dụng Expo Go trên điện thoại. Có thể nhấn `a` trong Terminal để mở Android Emulator đã cài sẵn.

## Các tab

- **Cửa hàng**: xem danh sách, kéo xuống để làm mới, tìm theo tên, lọc theo hãng/loại/tồn kho/RAM/giá/nổi bật và sắp xếp theo giá hoặc số lượng đã bán.
- **Thêm máy**: thêm sản phẩm hoặc nhập từ màn chi tiết để sửa. Biểu mẫu kiểm tra các trường bắt buộc, giá, RAM và dung lượng ổ cứng.
- **Thống kê**: xem tổng sản phẩm, doanh thu, số đã bán, giá trung bình, số liệu theo loại, sản phẩm bán chạy, hãng bán chạy và sản phẩm sắp hết hàng.
- **Nổi bật**: xem các sản phẩm được đánh dấu cùng thống kê riêng.

Chạm vào một sản phẩm trong danh sách để xem chi tiết, giá trị doanh thu/tồn kho/tổng số máy, rồi chỉnh sửa hoặc xóa. Ứng dụng tạo một số dữ liệu mẫu ở lần chạy đầu tiên; các thay đổi được lưu trong `computer-store.db` và vẫn còn sau khi đóng ứng dụng.

## Thư mục mã nguồn

- `app/`: màn hình và điều hướng theo Expo Router; `(tabs)/_layout.js` định nghĩa thanh điều hướng dưới.
- `src/database.js`: tạo bảng SQLite, thêm dữ liệu mẫu và các truy vấn thống kê.
- `src/components/Shared.js`: các thành phần giao diện dùng lại như thẻ sản phẩm, tiêu đề và thông báo.
- `src/theme.js`: màu sắc, tên loại sản phẩm và định dạng giá/số.

Giá mẫu được hiển thị bằng USD để khớp với dữ liệu tham khảo trong đề bài.
