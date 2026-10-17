# Mây — Bài thực hành 02

Ứng dụng React xem thời tiết 8 thành phố Việt Nam. JavaScript + CSS, Vite; gọi trực tiếp Open-Meteo, không cần backend hoặc API key.

## Chạy trên máy

Cài Node.js bản LTS. Giải nén và mở **thư mục chứa package.json** bằng VS Code, mở Terminal rồi chạy:

```bash
npm install
npm run dev
```

Mở địa chỉ localhost mà terminal hiển thị. Không mở index.html bằng cách nhấp đúp hoặc Live Server vì đây là dự án React chạy qua Vite.

```bash
npm run build
npm run preview
```

Lệnh build tạo thư mục dist để kiểm tra bản sản phẩm. Không nộp dist hoặc node_modules.

## Các yêu cầu

| Yêu cầu | Cách thực hiện |
| --- | --- |
| YC1 | 8 thành phố đúng danh sách; tô mint thành phố được chọn |
| YC2 | Biểu tượng SVG, mô tả, nhiệt độ, độ ẩm, gió, giờ và ngày cập nhật |
| YC3 | 7 ngày từ API, thứ/ngày, biểu tượng, mô tả, cao nhất/thấp nhất |
| YC4 | Ban đầu chưa chọn; đang tải; lỗi có nút Thử lại; timeout 15 giây |
| YC5 | °F = °C × 9/5 + 32; không gọi API khi đổi đơn vị |
| YC6 | Từ 768px: danh sách và nội dung thành 2 cột; dưới 768px: xếp dọc |
| Nâng cao | Tìm không dấu, yêu thích localStorage, nền theo thời tiết |

Dữ liệu luôn lấy trực tiếp từ API, không dùng số liệu giả khi mạng lỗi. Dự báo 7 ngày bao gồm ngày hiện tại theo dữ liệu Open-Meteo. Thời gian hiển thị theo UTC+7, không phụ thuộc múi giờ máy. Yêu thích là nút ngôi sao cạnh từng thành phố.

## Cấu trúc để học và giải thích bài

- index.html: nơi React gắn giao diện vào phần tử root.
- src/main.jsx: khởi động React và nhập CSS.
- src/App.jsx: các state, sự kiện bấm, gọi API bằng useEffect và giao diện.
- src/weather.js: danh sách thành phố, hàm fetchWeather, đổi đơn vị, xử lý mã thời tiết và tìm không dấu.
- src/WeatherIcon.jsx: vẽ biểu tượng nắng, mây, mưa bằng SVG.
- src/style.css: màu, bố cục, responsive tại 768px.
- package.json: khai báo thư viện và lệnh chạy.
- .gitignore: loại node_modules, dist và .env khỏi Git.

### Luồng hoạt động

1. Bấm thành phố: chooseCity cập nhật selected và trạng thái loading.
2. useEffect chạy khi selected hoặc retry thay đổi.
3. fetchWeather gửi tọa độ lên Open-Meteo rồi kiểm tra phản hồi.
4. Thành công: lưu JSON vào weather, chuyển sang success; lỗi: chuyển sang error.
5. map duyệt daily.time; chỉ số index nối ngày với mã thời tiết và nhiệt độ trong các mảng còn lại.
6. Đổi đơn vị chỉ cập nhật unit. temperature đổi giá trị để hiển thị; dữ liệu gốc vẫn là °C.
7. Cleanup hủy yêu cầu cũ khi chuyển thành phố để tránh hiển thị nhầm kết quả.

## Kiểm tra trước khi nộp

- Lần đầu mở phải thấy hướng dẫn chọn thành phố.
- Bấm lần lượt 8 thành phố, kiểm tra tên và đủ 7 ngày dự báo.
- Bấm nhanh nhiều thành phố: kết quả cuối phải thuộc thành phố được chọn cuối.
- Mở DevTools → Network, đổi °C/°F: không có request forecast mới.
- DevTools → Network → Offline rồi chọn thành phố khác: thấy lỗi. Bật mạng lại và bấm Thử lại.
- Tìm `da nang`, `ha noi`: ra đúng thành phố; nhập chuỗi lạ: có thông báo không tìm thấy.
- Đánh sao và tải lại trang: ngôi sao được giữ.
- Thử chiều rộng 375px, 767px, 768px và màn hình máy tính.

## Đưa lên GitHub và nộp Slink

Tên repo đề nghị: **B25DCCC048-BaiTH02**. Kiểm tra lại mã sinh viên trước khi nộp.

1. Trên GitHub tạo repository trống với tên trên. Không chọn tạo sẵn README nếu định dùng các lệnh bên dưới.
2. Trong terminal ở thư mục dự án, chạy:

```bash
git init
git add .
git commit -m "Hoan thanh BaiTH02 React Weather"
git branch -M main
git remote add origin https://github.com/TEN_GITHUB/B25DCCC048-BaiTH02.git
git push -u origin main
```

Thay TEN_GITHUB bằng tên tài khoản của bạn. Kiểm tra `git status` và file đã staged trước khi commit; .gitignore đã bỏ node_modules và dist.

3. Nếu để private: GitHub repository → Settings → Collaborators → Add people → mời **anhttptit**.
4. Dán URL repository vào phần nội dung trả lời trên Slink. Không nộp URL localhost.

## Tài liệu

- https://open-meteo.com/en/docs
- https://react.dev/
- https://vite.dev/

Phông Be Vietnam Pro được tải từ Google Fonts; khi không có kết nối sẽ dùng sans-serif trên máy.
