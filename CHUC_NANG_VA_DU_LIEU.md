# Calendario — Chức năng và cơ chế lưu dữ liệu

Tài liệu mô tả mã nguồn hiện tại, kiểm tra ngày 24/09/2026. Căn cứ chính: `src/App.jsx`, `src/main.jsx` và `package.json`.

## 1. Tổng quan

**DK Events Calendario** là ứng dụng frontend React + Vite để quản lý sự kiện và các công việc chuẩn bị sự kiện. Giao diện chủ yếu bằng tiếng Tây Ban Nha, một số trạng thái bằng tiếng Anh.

Ứng dụng hiện là bản chạy với dữ liệu mẫu trong trình duyệt, chưa phải hệ thống có lưu trữ dùng chung cho nhiều người.

## 2. Danh sách chức năng đã có

| Nhóm | Chức năng thực tế |
| --- | --- |
| Lịch tháng — Calendario | Mở ở tháng hiện tại theo máy người dùng; chuyển tháng trước/sau; đánh dấu hôm nay; hiển thị sự kiện và công việc theo ngày. |
| Chi tiết ngày | Bấm ngày để xem công việc, sự kiện, người phụ trách, ghi chú; cập nhật nhanh trạng thái; thêm công việc vào ngày đó. |
| Danh sách — Lista | Xem công việc dạng bảng, sắp xếp ngày tăng dần, gồm ngày, tên công việc, sự kiện, người phụ trách, trạng thái và ghi chú. Bấm một dòng để sửa. |
| Danh mục sự kiện — Eventos | Xem tên, loại, ngày tổ chức, tổng số công việc và phần trăm hoàn thành của mỗi sự kiện. |
| Thêm sự kiện | Nhập tên, ngày và chọn `Bodas` (đám cưới) hoặc `Corporativo` (doanh nghiệp). |
| Tạo công việc tự động | Khi **tạo mới** sự kiện `Bodas`, sinh 53 công việc từ mẫu, kèm người phụ trách và ngày thực hiện. Có bảng xem trước. |
| Sự kiện doanh nghiệp | Khi tạo mới `Corporativo`, không tự sinh công việc; người dùng thêm thủ công. |
| Sửa sự kiện | Sửa tên, ngày, loại; cập nhật tên sự kiện liên kết, tên công việc và ngày của các công việc liên quan. |
| Xóa sự kiện | Có hộp thoại xác nhận; xóa sự kiện và các công việc có tên sự kiện tương ứng. |
| Quản lý công việc | Thêm, sửa, xóa; chỉnh tên, sự kiện, người phụ trách, ngày, trạng thái và ghi chú. |
| Lọc công việc | Kết hợp lọc theo người phụ trách, sự kiện và trạng thái. |
| Thống kê tháng | Tổng công việc, chưa bắt đầu, đang thực hiện và đã hoàn thành của tháng đang chọn, sau khi áp dụng bộ lọc. |
| Phân biệt bằng màu | Màu theo người phụ trách, trạng thái và dấu mốc sự kiện. |

### Chi tiết nghiệp vụ

- **Người phụ trách có sẵn:** Denisse, Danielle, Jeroen, Tuty, Novia, Novios, Corp. Chưa có màn hình thêm/sửa danh mục này.
- **Trạng thái:** `Not started`, `In progress`, `Completed`.
- **Mẫu đám cưới:** 53 đầu việc, từ 240 ngày trước sự kiện đến 5 ngày sau sự kiện. Ví dụ: đặt địa điểm, DJ, ảnh/video, thiệp mời, hợp đồng, RSVP, chia sẻ chương trình và kết thúc sự kiện.
- **Cách tính hạn:** ngày công việc = ngày sự kiện − `daysBefore`. Giá trị `-5` tương ứng 5 ngày sau sự kiện.
- **Tiến độ sự kiện:** số công việc `Completed` / tổng công việc × 100, làm tròn đến số nguyên; không có công việc thì hiển thị 0%.
- **Phạm vi bộ lọc:** tác động tới công việc trên lịch, chi tiết ngày, bảng Lista và thống kê tháng. Không lọc danh mục Eventos, tiến độ của từng sự kiện hoặc các dấu mốc sự kiện trên lịch.
- **Phạm vi Lista:** tất cả ngày có công việc phù hợp bộ lọc, không chỉ tháng đang xem trên lịch.

## 3. Đã liên kết Database chưa?

**Chưa.** Mã nguồn ứng dụng hiện không có kết nối Database.

Qua kiểm tra:

- Không có backend/API nghiệp vụ trong cấu trúc dự án hiện tại.
- Không có lời gọi API lấy/lưu sự kiện và công việc trong `src`.
- Không có tích hợp MySQL, PostgreSQL, MongoDB, SQLite, Firebase hoặc Supabase trong mã ứng dụng và dependencies hiện tại.
- Vite chỉ phục vụ frontend khi phát triển; không phải backend lưu dữ liệu.
- Không có đăng nhập, phân quyền hoặc đồng bộ dữ liệu giữa người dùng.

## 4. Đang lưu dữ liệu kiểu gì?

### 4.1. Lưu tạm bằng React state trong bộ nhớ trình duyệt

Các mảng dữ liệu JavaScript được giữ trong component `App` bằng `useState`:

```jsx
const [events, setEvents] = useState(SEED_EVENTS.map((e, i) => ({
  id: i, name: e.name, date: dateToExcel(e.date), type: e.type,
})));
const [tasks, setTasks] = useState(() => buildSeedTasks());
```

Thao tác thêm/sửa/xóa chỉ thay đổi các mảng này thông qua `setEvents` và `setTasks`. Không ghi xuống Database hay file trên máy.

| Cơ chế | Đang sử dụng? |
| --- | --- |
| React state / bộ nhớ của trang đang mở | Có |
| Database | Không |
| localStorage | Không |
| sessionStorage | Không |
| IndexedDB | Không |
| Cookie để lưu sự kiện/công việc | Không |
| File JSON, Excel hoặc CSV để lưu thay đổi | Không |

### 4.2. Nguồn dữ liệu khởi tạo

Dữ liệu mẫu được khai báo trực tiếp trong `src/App.jsx`:

- `SEED_EVENTS`: 5 sự kiện mẫu, gồm 4 đám cưới và 1 sự kiện doanh nghiệp.
- `BODAS_TEMPLATE`: 53 mẫu công việc đám cưới.
- `buildSeedTasks()`: tạo 212 công việc ban đầu cho 4 đám cưới; trạng thái mặc định là `Not started`, ghi chú rỗng.

| Sự kiện mẫu | Ngày tổ chức | Loại |
| --- | --- | --- |
| Cabas Rodriguez | 18/07/2026 | Bodas |
| Zelaya Irias | 25/07/2026 | Bodas |
| Pinel Zambrano | 01/08/2026 | Bodas |
| Kafie Facusse | 05/09/2026 | Bodas |
| Tigo 30 años | 22/08/2026 | Corporativo |

### 4.3. Cấu trúc dữ liệu

**Sự kiện:**

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Mã sự kiện trong bộ nhớ |
| `name` | Tên sự kiện |
| `date` | Ngày dạng số serial theo quy ước Excel |
| `type` | `Bodas` hoặc `Corporativo` |

**Công việc:**

| Thuộc tính | Ý nghĩa |
| --- | --- |
| `id` | Mã công việc trong bộ nhớ |
| `date` | Ngày thực hiện dạng số serial |
| `task` | Tên công việc |
| `owner` | Người phụ trách |
| `event` | **Tên** sự kiện liên kết, không phải khóa ngoại `eventId` |
| `status` | Trạng thái công việc |
| `comments` | Ghi chú dạng văn bản |

Ngày được chuyển đổi bằng các hàm `dateToExcel()` và `excelToDate()`, dùng mốc 30/12/1899. Đây chỉ là cách biểu diễn ngày, **không có nghĩa ứng dụng đang liên kết hay lưu vào Excel**.

### 4.4. Hệ quả khi sử dụng

- Chuyển tab Calendario/Lista/Eventos trong cùng trang vẫn giữ các thay đổi.
- Tải lại trang hoặc mở lại ứng dụng sẽ khởi tạo lại dữ liệu mẫu; các thay đổi trước đó mất.
- Các tab trình duyệt và thiết bị không chia sẻ hay đồng bộ dữ liệu với nhau.
- Các nút `Guardar` / `Guardar cambios` chỉ cập nhật dữ liệu tạm, không lưu lâu dài.

## 5. Giới hạn cần biết

1. Chưa có lưu bền vững, sao lưu, nhập/xuất Excel/CSV, đăng nhập, phân quyền hoặc thông báo nhắc hạn.
2. Sự kiện và công việc liên kết bằng **tên sự kiện**. Tên trùng có thể khiến việc sửa/xóa ảnh hưởng nhầm nhóm công việc; nên dùng tên duy nhất.
3. Đổi loại của sự kiện đã có không tự tạo thêm hay xóa bộ 53 công việc. Cơ chế tự sinh chỉ nằm ở thao tác tạo mới `Bodas`.
4. Khi sửa sự kiện, công việc có tên gốc khớp mẫu sẽ được tính lại ngày theo mẫu; các công việc khác được dời theo chênh lệch ngày sự kiện. Cần kiểm tra lại các ngày đã chỉnh thủ công.
5. Xóa công việc không có hộp thoại xác nhận riêng; chưa có chức năng hoàn tác.
6. Các hàm ngày đang pha trộn giờ địa phương và UTC (`toISOString()`), nên có nguy cơ lệch ngày trong ô nhập ở một số múi giờ. Cần kiểm tra ngày hiển thị trước khi lưu.

## 6. Mã nguồn tham chiếu

- `src/App.jsx`: mẫu dữ liệu, quản lý state, nghiệp vụ sự kiện/công việc và các màn hình.
- `src/main.jsx`: khởi tạo React.
- `package.json`: dependencies và các lệnh chạy/build/lint.
- Hướng dẫn thao tác: [HUONG_DAN_SU_DUNG.md](./HUONG_DAN_SU_DUNG.md).


mail của khách: tutychau@gmail.com