# VehicleChain Insurance DApp — Frontend

**Next.js frontend** cho hệ thống bảo hiểm xe cơ giới phi tập trung.

## Cấu trúc thư mục

```
vehicle-insurance-dapp/
├── components/           # React components
│   ├── Admin/            # Quản trị (AdminStats, ClaimManagement, DocumentManagement...)
│   ├── Analytics/        # Biểu đồ thống kê (PolicyAnalytics, RevenueAnalytics...)
│   ├── Chat/             # ChatWidget — AI Chatbot
│   ├── Claims/           # Yêu cầu bồi thường
│   ├── Dashboard/        # Trang chủ người dùng
│   ├── Layout/           # Layout, Sidebar, Header
│   ├── Plans/            # Gói bảo hiểm + mua
│   └── Policies/         # Quản lý hợp đồng
├── pages/                # Next.js pages
│   ├── index.js          # Landing page
│   ├── dashboard.js      # Dashboard
│   ├── plans.js          # Mua bảo hiểm
│   ├── policies.js       # Hợp đồng
│   ├── claims.js         # Bồi thường
│   ├── analytics.js      # Thống kê
│   └── admin.js          # Quản trị
├── services/
│   ├── contract.js       # Smart contract service
│   └── pinata.js         # IPFS upload service
├── web3/
│   ├── contracts/
│   │   └── VehicleInsuranceDApp.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── setup.js
│   └── hardhat.config.js
├── public/locales/       # i18n: vi / en / fr
├── .env.example
└── next.config.js
```

## Khởi động

```bash
npm install
cp .env.example .env.local
# Điền giá trị vào .env.local
npm run dev
```

Xem hướng dẫn đầy đủ tại [README.md gốc](../README.md).
