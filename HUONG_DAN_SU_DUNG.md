# Calendario — Hướng dẫn sử dụng (khách hàng / team)

Tài liệu dành cho người dùng cuối: planner, coordinator và thành viên team DK Events.  
Cập nhật: 26/09/2026 — ứng dụng đã lưu event và task trên **Supabase** (dữ liệu còn sau khi refresh).

> **Quan trọng:** Mọi thành viên dùng chung một workspace. Thay đổi hợp lệ được lưu lên cloud.  
> Một số nút trên giao diện **chưa hoàn thiện** (xem mục 12). Admin tạo tài khoản và quyền truy cập theo tài liệu trong thư mục **`SUPABASE`** trên Google Drive (mục 15).

---

## 1. Truy cập ứng dụng

### Team / khách hàng (môi trường đã deploy hoặc link nội bộ)

1. Mở URL Calendario do quản trị viên cung cấp (ví dụ qua hosting hoặc port forwarding).
2. Nhập **email** và **password** do admin cấp.
3. Bấm **Sign in**.
4. Chờ vài giây nếu thấy `Checking access...`.
5. Vào màn hình **DK Events Calendario**.

Nếu thấy **Access denied**: tài khoản đã đăng nhập Supabase nhưng chưa được thêm vào `team_members` hoặc đã bị vô hi hiệu hóa. Liên hệ admin — **không** tự sửa database.

Phiên đăng nhập thường được giữ sau `Ctrl + R`. Đổi tab Chrome rồi quay lại **không** nên làm mất calendar (nếu vẫn bị, báo admin/kỹ thuật).

### Developer (chạy local)

Tại thư mục dự án Calendario:

```powershell
npm install
npm run dev -- --host 127.0.0.1
```

Mở địa chỉ Vite in ra (thường `http://127.0.0.1:5173/`). Cần file `.env.local` với biến Supabase do admin cung cấp.

---

## 2. Làm quen giao diện

| Nhãn | Ý nghĩa |
| --- | --- |
| `Calendario` | Lịch theo tháng |
| `Lista` | Bảng công việc |
| `Eventos` | Danh sách sự kiện và tiến độ |
| `+ Nueva tarea` | Thêm công việc |
| `+ Nuevo evento` / `+ Agregar evento` | Thêm sự kiện |
| `Tarea` | Tên công việc (khi sửa: chỉ phần tên gốc, không gõ thêm `- tên event`) |
| `Evento` | Sự kiện liên quan |
| `Responsable` | Người phụ trách |
| `Estado` | Trạng thái |
| `Fecha` | Ngày thực hiện / hạn |
| `Comentarios` | Ghi chú |
| `Editar` | Chỉnh sửa |
| `Eliminar` | Xóa |
| `Guardar` / `Guardar cambios` | Lưu lên Supabase |
| `Cancelar` | Hủy / đóng form |

**Trạng thái công việc**

| Giá trị | Ý nghĩa | Nhãn bộ lọc |
| --- | --- | --- |
| `Not started` | Chưa bắt đầu | `No iniciado` |
| `In progress` | Đang làm | `En progreso` |
| `Completed` | Hoàn thành | `Completado` |

**Người phụ trách có sẵn:** Denisse, Danielle, Jeroen, Tuty, Novia, Novios, Corp.

Trên lịch, tên hiển thị dạng **`Tên task - Tên event`**. Đó chỉ là cách hiển thị; khi sửa task, chỉ đổi phần tên task.

---

## 3. Xem lịch và chi tiết ngày

1. Chọn **Calendario**.
2. Dùng `‹` và `›` để đổi tháng (icon màu xám).
3. Trên ô ngày:
   - Hôm nay: số ngày trong vòng tròn cam.
   - Sự kiện: nhãn xanh dương (🎉).
   - Task: màu theo responsable; tối đa 3 dòng, `+N más` nếu còn thêm.
4. Bấm một ngày → xem/sửa task, đổi trạng thái nhanh, hoặc **+ Agregar tarea aquí**.
5. Đóng bằng `×` hoặc bấm nền tối bên ngoài.

Tuần bắt đầu **Chủ nhật** (`Dom`). Task trên lịch tuân theo **bộ lọc** đang chọn.

---

## 4. Tạo sự kiện mới

### 4.1. Bodas — tự sinh 53 task

1. **+ Nuevo evento** (hoặc **Eventos → + Agregar evento**).
2. **Nombre del evento:** tên dễ nhận (nên dùng tên riêng, tránh trùng nếu có thể).
3. **Tipo → Bodas**.
4. **Fecha del evento:** ngày tổ chức.
5. Mở **Ver las 53 tareas que se generarán** để xem trước.
6. **Crear y generar 53 tareas** — chờ lưu xong.
7. Kiểm tra **Eventos** (53 tareas) và **Lista** / lịch các tháng xung quanh.

Hạn task trải từ nhiều tháng **trước** ngày event (và một số task sau event). **`Tareas este mes`** chỉ đếm task trong **tháng đang xem**, không phải tổng 53.

### 4.2. Corporativo — tự sinh 46 task

1. Mở form tạo event.
2. Nhập tên và ngày.
3. **Tipo → Corporativo**.
4. Xác nhận preview **46 tareas**.
5. **Crear y generar 46 tareas**.

Không còn đúng với bản cũ “Corporativo không tự sinh task”.

---

## 5. Xóa sự kiện

1. **Eventos** → **Eliminar** tại event cần xóa.
2. Đọc số task sẽ mất → **Sí, eliminar**.

Xóa trên Supabase, **không hoàn tác**. Mọi task của event đó cũng bị xóa (cascade).

---

## 6. Sửa sự kiện — chưa dùng cho công việc thật

Tab **Eventos** có nút **Editar**, nhưng **chưa lưu Supabase**. Sau **Guardar cambios**, refresh (`Ctrl + R`) sẽ mất thay đổi.

**Không dùng Editar event** cho event khách hàng cho đến khi team kỹ thuật thông báo đã bật persistence. Muốn đổi tên/ngày event thật → liên hệ admin/kỹ thuật.

---

## 7. Thêm task thủ công

- **+ Nueva tarea** → ngày mặc định hôm nay.
- Trong lịch: chọn ngày → **+ Agregar tarea aquí**.

Điền **Tarea**, **Evento**, **Responsable**, **Estado**, **Fecha**, **Comentarios** → **Agregar** (lúc lưu: `Agregando...`).

Phải có ít nhất một event trước. Tên task **không** cần (và **không nên**) thêm hậu tố `- tên event`.

---

## 8. Sửa, đổi trạng thái, xóa task

### Sửa đầy đủ

**Lista** (bấm dòng) hoặc chi tiết ngày → **Editar tarea** → **Guardar** (`Guardando...`).

### Đổi nhanh trạng thái

Chi tiết ngày → dropdown **Estado** → lưu Supabase ngay.

### Xóa

**Editar tarea** → **Eliminar** — không có xác nhận riêng; xóa vĩnh viễn trên cloud.

Sau mọi thao tác quan trọng, nên **Ctrl + R** để xác nhận dữ liệu còn đúng.

---

## 9. Lọc và tìm

Ba dropdown phía trên:

- **Todos los responsables**
- **Todos los eventos**
- **Todos los estados**

Có thể kết hợp. Bỏ lọc: chọn lại `Todos los ...`.

- **Lista:** mọi ngày (theo lọc), sắp xếp tăng dần theo ngày.
- **Calendario:** task trong tháng đang mở.
- **Eventos** và marker 🎉 trên lịch **không** bị lọc ẩn.

Chưa có ô tìm kiếm tự do theo chữ.

**Lưu ý:** hai event **trùng tên** có thể làm lọc/thống kê theo tên bị lẫn. Nên đặt tên phân biệt.

---

## 10. Thống kê và tiến độ

| Nhãn | Ý nghĩa |
| --- | --- |
| `Tareas este mes` | Tổng task trong tháng lịch đang xem (sau lọc) |
| `No iniciadas` / `En progreso` / `Completadas` | Chia theo trạng thái; tổng ba ô = `Tareas este mes` |

**Eventos:** thanh % hoàn thành theo **toàn bộ** task của event, không phụ thuộc bộ lọc.

---

## 11. Làm việc nhóm — khách hàng cần biết

| Chủ đề | Hướng dẫn |
| --- | --- |
| Dữ liệu chung | Mọi member active thấy cùng event/task sau khi tải/reload trang. |
| Realtime | **Chưa có.** Người khác sửa → bạn **Ctrl + R** (hoặc thao tác CRUD của bạn sẽ tải lại data). |
| Đăng xuất trên calendar | **Chưa có** nút Sign out trên màn chính. Admin vô hiệu hóa user trong Supabase nếu cần. |
| Mật khẩu | Admin tạo mật khẩu tạm; đổi mật khẩu / quên mật khẩu trong app **chưa đầy đủ** — liên hệ admin. |
| Excel | Không import/export Excel trong app. Template Bodas/Corporativo nằm trên Supabase. |
| Reminder màu trên lịch | **Chưa triển khai.** |
| Sao lưu | Admin lo backup Supabase; user không export từ app. |

---

## 12. Chức năng chưa làm — không coi là lỗi

- **Editar event** lưu lâu dài.
- Reminder, Excel sync, quản lý team trong app, realtime, đăng xuất trên calendar.
- Xử lý hoàn hảo hai event trùng tên trên bộ lọc.

---

## 13. Quy trình thử nhanh (dữ liệu test)

Dùng tiền tố `TEST -` để dễ xóa sau.

1. Tạo `TEST - Boda` (Bodas) → 53 task → refresh → còn.
2. Tạo `TEST - Corp` (Corporativo) → 46 task → refresh → còn.
3. **+ Nueva tarea** gắn event test → sửa → đổi status → xóa → refresh kiểm tra.
4. **Eventos** → xóa event test.

---

## 14. Tình huống thường gặp

| Tình huống | Gợi ý |
| --- | --- |
| Không thấy task vừa tạo | Kiểm tra lọc, tháng trên lịch, mở **Lista** bỏ lọc. |
| Thống kê 0 nhưng Lista có data | Thống kê chỉ tháng đang xem trên **Calendario**. |
| Bodas 53 task nhưng tháng event ít task | Bình thường — task nằm nhiều tháng trước. |
| `Access denied` | Liên hệ admin (`team_members`). |
| Lỗi đỏ trên màn hình sau khi lưu | Chụp màn hình, ghi thao tác + giờ, gửi admin/kỹ thuật. |
| Đã Editar event, refresh mất | Đúng hành vi hiện tại — chưa persist. |
| Tab khác quay lại bị `Checking access...` | Báo kỹ thuật nếu vẫn xảy ra sau bản mới. |

---

## 15. Tài liệu liên quan

Bộ tài liệu trên **Google Drive**, thư mục **`Documentation for project use`**:

### Thư mục gốc `Calendario`

| File | Dùng cho |
| --- | --- |
| `00_START_HERE.md` | Điểm bắt đầu — nên đọc file nào trước |

### `CalendarProject`

| File | Dùng cho |
| --- | --- |
| `HUONG_DAN_SU_DUNG.md` | Hướng dẫn sử dụng (Tiếng Việt) — tài liệu này |
| `GUIA_USUARIO_ES.md` | Hướng dẫn sử dụng (Español) |
| `USER_GUIDE_EN.md` | Hướng dẫn sử dụng (English) |
| `PROJECT_DOCUMENTATION_EN.md` | Tổng quan dự án (English) |
| `PROJECT_DOCUMENTATION_ES.md` | Tổng quan dự án (Español) |

### `SUPABASE`

| File / thư mục | Dùng cho |
| --- | --- |
| `GUIA_ADMIN_SUPABASE.md` | Quản trị Supabase — user, RLS, backup (Español) |
| `SUPABASE_ADMIN_GUIDE.md` | Quản trị Supabase (English) |
| `README.md` | Giới thiệu schema, migration và thiết lập |
| `migrations/` | SQL migration (bảng, RLS, templates, RPC) |
| `tests/` | Script kiểm tra schema |

Bản hướng dẫn sử dụng **tiếng Việt** là file này (`HUONG_DAN_SU_DUNG.md`), thường gửi kèm source hoặc link riêng nếu team cần.

---

## 16. Lệnh developer (không bắt buộc với khách)

```powershell
npm run build
npm run lint
```

`build`: bản production trong `dist`. `lint`: kiểm tra ESLint.
