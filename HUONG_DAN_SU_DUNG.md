# Calendario — Hướng dẫn sử dụng

Hướng dẫn theo giao diện và mã nguồn hiện tại, kiểm tra ngày 24/09/2026.

> **Quan trọng:** Ứng dụng chưa lưu dữ liệu lâu dài. Thêm/sửa/xóa chỉ có hiệu lực trong trang đang mở. Tải lại trang sẽ mất thay đổi và quay về dữ liệu mẫu. Không dùng bản hiện tại làm nơi lưu duy nhất cho công việc thực tế.

## 1. Khởi động ứng dụng

### Trên máy Windows hiện tại

Mở Terminal/PowerShell và chạy:

```powershell
cd "C:\Users\Mewww\Documents\Source\NewJOB_Database\Calendario"
npm run dev -- --host 127.0.0.1
```

Mở địa chỉ Vite in ra trong Terminal, thường là:

```text
http://127.0.0.1:5173/
```

- Nếu cổng 5173 đã được dùng, Vite có thể chọn cổng khác; dùng đúng địa chỉ trong Terminal.
- Giữ tiến trình chạy trong lúc sử dụng. Để dừng tiến trình do bạn khởi động, bấm `Ctrl+C` tại Terminal đó.
- Nếu server đã chạy, chỉ cần mở địa chỉ truy cập, không cần chạy thêm bản thứ hai.

### Khi thiết lập trên máy khác

1. Cài Node.js tương thích với phiên bản Vite của dự án và npm. Môi trường đã chạy thành công dùng Node.js 24.16.0.
2. Mở Terminal tại thư mục dự án.
3. Chạy `npm install` để cài dependencies.
4. Chạy lệnh khởi động ở trên.

Nếu gặp lỗi `'vite' is not recognized`, hãy cài dependencies ngay trên máy đang dùng bằng `npm install`. Không nên dựa vào `node_modules` sao chép từ hệ điều hành khác.

## 2. Làm quen với giao diện

| Nhãn trên giao diện | Ý nghĩa |
| --- | --- |
| `Calendario` | Lịch theo tháng |
| `Lista` | Bảng danh sách công việc |
| `Eventos` | Danh mục sự kiện và tiến độ |
| `+ Nueva tarea` | Thêm công việc |
| `+ Nuevo evento` / `+ Agregar evento` | Thêm sự kiện |
| `Tarea` | Tên công việc |
| `Evento` | Sự kiện |
| `Responsable` | Người phụ trách |
| `Estado` | Trạng thái |
| `Fecha` | Ngày |
| `Comentarios` | Ghi chú |
| `Editar` | Chỉnh sửa |
| `Eliminar` | Xóa |
| `Guardar` / `Guardar cambios` | Lưu thay đổi vào bộ nhớ tạm |
| `Cancelar` | Hủy/đóng biểu mẫu |

Các trạng thái:

| Giá trị | Ý nghĩa | Nhãn tương ứng trong bộ lọc |
| --- | --- | --- |
| `Not started` | Chưa bắt đầu | `No iniciado` |
| `In progress` | Đang thực hiện | `En progreso` |
| `Completed` | Đã hoàn thành | `Completado` |

## 3. Xem lịch và công việc trong ngày

1. Chọn **Calendario**.
2. Dùng `‹` và `›` để chuyển tháng.
3. Xem các ô ngày:
   - Ngày hiện tại có dấu tròn màu nổi bật.
   - Nhãn sự kiện có màu xanh dương.
   - Công việc có màu theo người phụ trách.
   - Mỗi ô hiển thị tối đa 3 công việc; `+N más` cho biết còn N công việc khác.
4. Bấm vào một ngày để mở chi tiết.
5. Trong chi tiết ngày, bạn có thể xem công việc, đổi trạng thái hoặc bấm tên công việc để sửa.
6. Đóng hộp thoại bằng nút `×` hoặc bấm vùng nền bên ngoài.

Lịch bắt đầu tuần từ Chủ nhật (`Dom`) đến Thứ bảy (`Sáb`). Các công việc trong ngày tuân theo bộ lọc đang chọn.

## 4. Tạo sự kiện mới

### 4.1. Tạo đám cưới và tự sinh công việc

1. Bấm **+ Nuevo evento**, hoặc vào **Eventos → + Agregar evento**.
2. Điền **Nombre del evento**: tên sự kiện, nên dùng tên chưa có trong danh sách.
3. Chọn **Tipo → Bodas**.
4. Chọn **Fecha del evento**: ngày tổ chức.
5. Bấm dòng **Ver las 53 tareas que se generarán** để xem trước ngày, tên công việc và người phụ trách.
6. Bấm **Crear y generar 53 tareas**.
7. Mở **Eventos** để kiểm tra sự kiện, hoặc **Lista** và lọc theo tên sự kiện để xem toàn bộ công việc.

Các hạn công việc trải từ 240 ngày trước sự kiện đến 5 ngày sau sự kiện. Vì vậy, không phải cả 53 công việc đều xuất hiện trong tháng tổ chức.

### 4.2. Tạo sự kiện doanh nghiệp

1. Mở biểu mẫu tạo sự kiện.
2. Nhập tên và ngày tổ chức.
3. Chọn **Tipo → Corporativo**.
4. Bấm **Crear evento**.
5. Thêm các công việc cần thiết theo mục 6.

Sự kiện doanh nghiệp không tự sinh công việc.

## 5. Sửa hoặc xóa sự kiện

### Sửa sự kiện

1. Chọn **Eventos**.
2. Bấm **Editar** tại sự kiện cần sửa.
3. Thay đổi tên, ngày hoặc loại.
4. Bấm **Guardar cambios**.
5. Kiểm tra lại công việc liên quan trong **Lista**.

**Lưu ý:**

- Sửa tên/ngày sự kiện cũng cập nhật các công việc liên quan.
- Công việc khớp tên gốc trong mẫu được tính ngày lại theo mẫu. Công việc không khớp mẫu được dời theo số ngày chênh lệch của sự kiện.
- Đổi `Corporativo` sang `Bodas` khi chỉnh sửa **không** tự sinh 53 công việc. Đổi chiều ngược lại cũng không tự xóa công việc cũ.
- Tránh đặt trùng tên sự kiện vì ứng dụng đang dùng tên để liên kết công việc.

### Xóa sự kiện

1. Trong **Eventos**, bấm **Eliminar** tại sự kiện.
2. Đọc hộp xác nhận và số công việc bị ảnh hưởng.
3. Bấm **Sí, eliminar** để xóa, hoặc **Cancelar** để giữ nguyên.

Thao tác xóa đồng thời sự kiện và công việc liên quan. Không có nút hoàn tác.

## 6. Thêm công việc thủ công

Có hai cách mở biểu mẫu:

- Bấm **+ Nueva tarea** trên thanh đầu trang: ngày mặc định là hôm nay.
- Trong **Calendario**, bấm ngày mong muốn rồi **+ Agregar tarea aquí**: ngày mặc định là ngày vừa chọn.

Sau đó:

1. Nhập **Tarea**: tên công việc.
2. Chọn **Evento**: sự kiện liên quan. Nếu chưa có sự kiện, nên tạo trước.
3. Chọn **Responsable**: người phụ trách.
4. Chọn **Estado**: trạng thái.
5. Kiểm tra **Fecha**: ngày thực hiện.
6. Nhập **Comentarios** nếu cần.
7. Bấm **Agregar**.

Nút thêm bị vô hiệu hóa khi tên công việc rỗng. Hãy tự kiểm tra ngày và sự kiện trước khi thêm vì kiểm tra dữ liệu đầu vào hiện còn đơn giản.

## 7. Sửa, đổi trạng thái và xóa công việc

### Sửa đầy đủ

1. Vào **Lista**, bấm dòng công việc; hoặc bấm công việc trong hộp chi tiết ngày.
2. Trong **Editar tarea**, sửa tên, sự kiện, người phụ trách, trạng thái, ngày hoặc ghi chú.
3. Bấm **Guardar** để cập nhật, hoặc **Cancelar** để bỏ thay đổi trong biểu mẫu.

### Đổi nhanh trạng thái

1. Vào **Calendario** và bấm ngày có công việc.
2. Chọn trạng thái từ danh sách ngay cạnh công việc.
3. Thay đổi có hiệu lực ngay trong bộ nhớ tạm, không cần bấm thêm nút lưu.

Nếu đang lọc theo trạng thái cũ, công việc có thể biến mất khỏi danh sách ngay sau khi đổi trạng thái. Đây là do bộ lọc.

### Xóa công việc

1. Mở **Editar tarea**.
2. Bấm **Eliminar**.

**Cẩn thận:** Xóa công việc diễn ra ngay, không có bước xác nhận riêng và không có nút hoàn tác.

## 8. Lọc và tìm công việc

Dùng ba danh sách chọn phía trên:

- **Todos los responsables**: chọn người phụ trách.
- **Todos los eventos**: chọn sự kiện.
- **Todos los estados**: chọn trạng thái.

Có thể kết hợp cả ba. Muốn bỏ lọc, đưa từng danh sách về tùy chọn `Todos los ...` tương ứng.

Ví dụ, để xem công việc chưa bắt đầu của Denisse cho một đám cưới:

1. Chọn **Lista**.
2. Chọn người phụ trách **Denisse**.
3. Chọn tên đám cưới trong bộ lọc sự kiện.
4. Chọn **No iniciado** trong bộ lọc trạng thái.

**Phạm vi hiển thị:**

- **Lista** hiển thị công việc ở tất cả ngày phù hợp bộ lọc, sắp theo ngày tăng dần.
- **Calendario** hiển thị công việc trong tháng đang mở.
- Bộ lọc không ẩn sự kiện trong **Eventos** hoặc các dấu mốc sự kiện trên lịch.
- Hiện chưa có ô tìm kiếm từ khóa tự do.

## 9. Đọc thống kê và tiến độ

Bốn ô thống kê phía trên gồm:

| Nhãn | Nội dung |
| --- | --- |
| `Tareas este mes` | Tổng công việc trong tháng đang chọn |
| `No iniciadas` | Số công việc chưa bắt đầu |
| `En progreso` | Số công việc đang thực hiện |
| `Completadas` | Số công việc đã hoàn thành |

Các con số tính theo bộ lọc và tháng đang chọn trên lịch. Khi chuyển sang Lista hoặc Eventos, phạm vi tháng của thống kê vẫn giữ nguyên. Muốn đổi tháng thống kê, quay về Calendario và chuyển tháng.

Trong **Eventos**, mỗi sự kiện có thanh tiến độ riêng, tính trên toàn bộ công việc của sự kiện, không phụ thuộc các bộ lọc phía trên.

## 10. Quy trình dùng thử gợi ý

1. Tạo một sự kiện `Bodas` có tên duy nhất và ngày trong tương lai.
2. Xem trước rồi tạo 53 công việc.
3. Vào **Lista**, lọc theo sự kiện mới.
4. Sửa người phụ trách và ghi chú của một công việc.
5. Đổi trạng thái công việc đó thành **Completed**.
6. Vào **Eventos** kiểm tra tiến độ tăng lên.
7. Tạo một sự kiện `Corporativo` và thêm công việc thủ công.

Đây là quy trình dùng thử dữ liệu tạm. Chưa có chức năng xuất dữ liệu để sao lưu các thay đổi.

## 11. Các tình huống thường gặp

| Tình huống | Giải thích / cách kiểm tra |
| --- | --- |
| Không thấy công việc vừa tạo | Kiểm tra bộ lọc, ngày và tháng. Mở Lista rồi bỏ lọc để xem rộng hơn. |
| Thống kê là 0 nhưng Lista có dữ liệu | Thống kê chỉ tính tháng đang chọn; Lista hiển thị mọi ngày. |
| Đám cưới có nhiều công việc nhưng tháng tổ chức ít công việc | Hạn công việc được phân bổ từ nhiều tháng trước sự kiện. |
| Tạo Corporativo nhưng không có công việc | Đúng thiết kế hiện tại; cần thêm thủ công. |
| Đã bấm Guardar nhưng tải lại bị mất | Guardar chỉ cập nhật React state, chưa lưu Database hay localStorage. |
| Máy/tab khác không thấy thay đổi | Chưa có lưu trữ chung hoặc đồng bộ. |
| Ngày trong ô nhập khác ngày đang xem | Mã chuyển đổi ngày có nguy cơ lệch do múi giờ. Kiểm tra kỹ trước khi lưu và báo lại để sửa; không tiếp tục chỉnh hàng loạt. |

## 12. Lệnh dành cho người phát triển

Chạy tại thư mục dự án:

```powershell
npm run build
npm run lint
```

- `build`: tạo bản frontend production trong `dist`.
- `lint`: kiểm tra quy tắc mã nguồn.
- Để xem thử bản đã build: chạy `npm run preview` và mở địa chỉ Terminal hiển thị.
- Các lệnh này không bổ sung Database hoặc làm dữ liệu được lưu lâu dài.

Chi tiết chức năng và lưu trữ: [CHUC_NANG_VA_DU_LIEU.md](./CHUC_NANG_VA_DU_LIEU.md).
