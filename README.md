# VehicleChain Insurance DApp

<div align="center">

![VehicleChain](https://img.shields.io/badge/VehicleChain-Insurance%20DApp-red?style=for-the-badge)
![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue?style=for-the-badge&logo=ethereum)
![AI](https://img.shields.io/badge/AI-RAG%20+%20Gemini-orange?style=for-the-badge)
![IPFS](https://img.shields.io/badge/Storage-IPFS%20+%20Pinata-65C2CB?style=for-the-badge)

**Hệ thống quản lý bảo hiểm xe cơ giới trên nền tảng Blockchain**  
**tích hợp lưu trữ phi tập trung IPFS và trợ lý ảo AI (RAG)**

*Đồ án tốt nghiệp — HUST kỳ 2025.2*

</div>

---

## 📋 Tổng quan

**VehicleChain Insurance DApp** là hệ thống quản lý hợp đồng bảo hiểm xe cơ giới phi tập trung, tuân thủ quy định pháp luật Việt Nam (Nghị định 67/2023/NĐ-CP). Hệ thống kết hợp:

- ⛓️ **Blockchain Ethereum** — Lưu trữ hợp đồng minh bạch, không thể giả mạo
- 🗂️ **IPFS + Pinata** — Lưu trữ tài liệu, hồ sơ phi tập trung  
- 🤖 **AI RAG Chatbot** — Tư vấn bảo hiểm dựa trên văn bản pháp luật thực tế
- 🌐 **Next.js + React** — Giao diện web hiện đại, đa ngôn ngữ (VI/EN/FR)

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                  NGƯỜI DÙNG / ADMIN                 │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│         vehicle-insurance-dapp (Next.js)            │
│   • 8 trang: Landing, Dashboard, Plans, Policies,   │
│     Claims, Analytics, Admin, ...                   │
│   • Glassmorphism UI — HUST CTT Theme               │
│   • Đa ngôn ngữ: Tiếng Việt / English / Français   │
└──────┬─────────────────────┬────────────────┬───────┘
       │                     │                │
┌──────▼──────┐   ┌──────────▼────┐  ┌────────▼──────┐
│  Ethereum   │   │  IPFS/Pinata  │  │  ai-service   │
│  Blockchain │   │  Off-chain    │  │  Python FastAPI│
│             │   │  Storage      │  │               │
│ • Hardhat   │   │ • Hồ sơ xe   │  │ • RAG Pipeline│
│ • Solidity  │   │ • Tài liệu BT│  │ • ChromaDB    │
│ • OpenZeppelin│  │ • Metadata  │  │ • Gemini API  │
│ • NĐ 67/2023│   └───────────────┘  │ • PDF Upload  │
└─────────────┘                      └───────────────┘
```

---

## 🚀 Tính năng chính

### 🚗 Quản lý bảo hiểm xe cơ giới
- **4 loại bảo hiểm** theo NĐ 67/2023:
  - TNDS Bắt buộc — Trách nhiệm dân sự với bên thứ 3
  - Vật chất xe (VCX) — Bảo hiểm thân vỏ xe
  - Người trên xe (NTX) — Bảo hiểm hành khách
  - Tai nạn lái xe (TNLX) — Bảo hiểm lái/phụ xe
- **Đăng ký xe** theo biển số, loại xe, năm sản xuất
- **Mua bảo hiểm** — thanh toán 1 lần hoặc hàng tháng
- **Quản lý hợp đồng** — gia hạn, hủy, theo dõi trạng thái

### 📋 Quy trình bồi thường 5 bước
```
PENDING → ĐANG_GIÁM_ĐỊNH → CHỜ_HỒ_SƠ → ĐANG_THẨM_ĐỊNH → APPROVED/REJECTED → PAID
```

### 🤖 Trợ lý AI tư vấn bảo hiểm
- **RAG (Retrieval-Augmented Generation)** — trả lời dựa trên văn bản pháp luật thật
- **Admin upload PDF** — Luật bảo hiểm, Nghị định, quy trình bồi thường
- **ChromaDB** — Vector database lưu embedding tài liệu
- **Gemini Flash** — Sinh câu trả lời chính xác, tránh hallucination

### 🔐 Phân quyền 3 cấp
| Vai trò | Quyền |
|---|---|
| **Người dùng** | Mua BH, xem hợp đồng, nộp yêu cầu BT |
| **Garage ủy quyền** | Cập nhật trạng thái giám định |
| **Admin (Owner)** | Toàn quyền + quản lý AI documents |

---

## 🛠️ Công nghệ sử dụng

| Lớp | Công nghệ | Version |
|---|---|---|
| **Frontend** | Next.js + React | 13.4.19 / 18.2.0 |
| **Styling** | Tailwind CSS | 3.3.1 |
| **Web3** | Wagmi + Ethers.js + RainbowKit | 2.x / 5.7.2 / 2.x |
| **Smart Contract** | Solidity + Hardhat | 0.8.20 / 2.22.0 |
| **Bảo mật SC** | OpenZeppelin | 5.0.2 |
| **Lưu trữ** | IPFS + Pinata | — |
| **AI Backend** | Python FastAPI + Uvicorn | 0.136.3 |
| **RAG Framework** | LangChain | 1.3.1 |
| **Vector DB** | ChromaDB (embedded) | 1.5.9 |
| **LLM** | Google Gemini Flash + Embedding | free tier |
| **PDF** | pdfplumber | 0.11.9 |
| **Auth** | JWT (python-jose + passlib) | — |

---

## 📁 Cấu trúc dự án

```
VehicleChain-Insurance-DApp/
├── vehicle-insurance-dapp/        # Next.js Frontend + Hardhat
│   ├── components/
│   │   ├── Admin/                 # AdminStats, ClaimManagement, DocumentManagement...
│   │   ├── Analytics/             # Charts, Stats
│   │   ├── Chat/                  # ChatWidget (AI Chatbot)
│   │   ├── Claims/                # ClaimCard, SubmitModal, ProcessModal
│   │   ├── Dashboard/             # StatsCards, PolicyOverview...
│   │   ├── Layout/                # Layout, Sidebar, Header
│   │   ├── Plans/                 # PlanCard, PurchaseModal
│   │   └── Policies/              # PolicyCard, PayPremiumModal
│   ├── pages/
│   │   ├── index.js               # Landing page
│   │   ├── dashboard.js           # Dashboard người dùng
│   │   ├── plans.js               # Mua bảo hiểm
│   │   ├── policies.js            # Quản lý hợp đồng
│   │   ├── claims.js              # Yêu cầu bồi thường
│   │   ├── analytics.js           # Thống kê phân tích
│   │   └── admin.js               # Quản trị hệ thống
│   ├── services/
│   │   ├── contract.js            # Smart contract service
│   │   └── pinata.js              # IPFS upload service
│   ├── web3/
│   │   ├── contracts/
│   │   │   └── VehicleInsuranceDApp.sol  # Smart contract chính
│   │   ├── scripts/
│   │   │   ├── deploy.js          # Deploy contract
│   │   │   └── setup.js           # Setup ban đầu
│   │   └── hardhat.config.js
│   ├── public/locales/            # i18n: vi / en / fr
│   └── .env.example
│
├── ai-service/                    # Python FastAPI — AI/RAG Service
│   ├── main.py                    # FastAPI app entry point
│   ├── config.py                  # Cấu hình từ .env
│   ├── routers/
│   │   ├── auth.py                # JWT admin login
│   │   ├── chat.py                # RAG chatbot endpoint
│   │   └── documents.py           # PDF upload/delete/list
│   ├── services/
│   │   ├── rag_service.py         # RAG pipeline: ChromaDB + Gemini
│   │   ├── pdf_service.py         # PDF extraction + chunking
│   │   └── auth_service.py        # JWT token management
│   ├── models/schemas.py          # Pydantic models
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── .gitattributes
└── README.md
```

---

## ⚙️ Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MetaMask** browser extension
- **Gemini API Key** (miễn phí tại [aistudio.google.com](https://aistudio.google.com))

---

### 1️⃣ Clone dự án

```bash
git clone https://github.com/hungnguyen-160104/VehicleChain-Insurance-DApp.git
cd VehicleChain-Insurance-DApp
```

---

### 2️⃣ Cài đặt Frontend (Next.js)

```bash
cd vehicle-insurance-dapp
npm install
```

Tạo file `.env.local` từ template:
```bash
cp .env.example .env.local
```

Điền các giá trị vào `.env.local`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id
NEXT_PUBLIC_NETWORK=localhost
NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST=0x...   # sau khi deploy
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

---

### 3️⃣ Deploy Smart Contract (Hardhat)

```bash
cd vehicle-insurance-dapp/web3
npm install

# Chạy Hardhat local node (terminal riêng)
npx hardhat node

# Deploy contract (terminal khác)
npx hardhat run scripts/deploy.js --network localhost

# Setup ban đầu (authorize garage)
npx hardhat run scripts/setup.js --network localhost
```

Copy địa chỉ contract vào `NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST` trong `.env.local`

---

### 4️⃣ Cài đặt AI Service (Python)

```bash
cd ai-service
```

Tạo file `.env` từ template:
```bash
cp .env.example .env
```

Điền Gemini API key vào `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

Cài packages:
```bash
pip install -r requirements.txt
```

Chạy AI service:
```bash
py main.py
# hoặc: python main.py
# Service chạy tại http://localhost:8000
# API docs tại http://localhost:8000/docs
```

---

### 5️⃣ Chạy Frontend

```bash
cd vehicle-insurance-dapp
npm run dev
# Mở http://localhost:3000
```

---

### 🖥️ Chạy toàn bộ dự án

**Cách 1 — Script tự động (Windows):**

```powershell
# PowerShell (khuyến nghị)
.\start.ps1

# Hoặc cmd
start.bat
```

Script sẽ tự động mở 3 terminal và khởi động tất cả dịch vụ.

**Cách 2 — Thủ công (3 terminal):**

| Terminal | Lệnh | Mục đích |
|---|---|---|
| Terminal 1 | `cd vehicle-insurance-dapp/web3 && npx hardhat node` | Blockchain local |
| Terminal 2 | `cd ai-service && py main.py` | AI Service |
| Terminal 3 | `cd vehicle-insurance-dapp && npm run dev` | Frontend |

**Cách 3 — Docker (chỉ AI Service):**

```bash
docker compose up --build
```

> Frontend và Blockchain vẫn chạy trực tiếp trên máy host.

---

## 📡 API Endpoints (AI Service)

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| POST | `/auth/login` | Admin đăng nhập | Không |
| POST | `/chat/` | Hỏi chatbot AI | Không |
| GET | `/chat/health` | Trạng thái AI | Không |
| POST | `/documents/upload` | Upload PDF | JWT |
| GET | `/documents/` | Danh sách tài liệu | JWT |
| DELETE | `/documents/{id}` | Xóa tài liệu | JWT |

> Xem API docs tại: **http://localhost:8000/docs**

---

## 🔑 Tài khoản mặc định

| Vai trò | Thông tin | Ghi chú |
|---|---|---|
| **Blockchain Admin** | Địa chỉ ví deploy contract | Tự động khi deploy |
| **AI Admin** | `admin` / `admin123` | Đổi trong `ai-service/.env` |
| **Garage** | Địa chỉ ví được cấp quyền | Admin cấp qua trang Admin |

---

## 📜 Smart Contract

**VehicleInsuranceDApp.sol** — tuân thủ NĐ 67/2023/NĐ-CP

```
Network: Ethereum (Localhost Hardhat / Holesky Testnet)
Solidity: ^0.8.20
OpenZeppelin: ReentrancyGuard + Ownable + Pausable
```

| Chức năng | Hàm |
|---|---|
| Đăng ký xe | `dangKyXe()` |
| Mua bảo hiểm | `muaBaoHiem()` |
| Gia hạn hàng tháng | `giaHanHangThang()` |
| Yêu cầu bồi thường | `yeuCauBoiThuong()` |
| Cập nhật trạng thái (Garage) | `garageCapNhatTrangThai()` |
| Xử lý claim (Admin) | `adminXuLyClaim()` |
| Chi trả bồi thường | `chiTraBoiThuong()` |
| Cấp quyền Garage | `capQuyenGarage()` |

---

## 👨‍💻 Tác giả

**Phạm Nguyễn Hùng Nguyên** — Sinh viên HUST 2025.2  
Email: hungnguyen16012004@gmail.com  
GitHub: [@hungnguyen-160104](https://github.com/hungnguyen-160104)

---

## 📄 Giấy phép

Dự án được phát triển phục vụ mục đích học thuật — Đồ án tốt nghiệp HUST kỳ 2025.2.
