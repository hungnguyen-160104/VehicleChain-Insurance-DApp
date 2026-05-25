import {
  FiShield,
  FiDollarSign,
  FiInfo,
  FiCheck,
  FiTruck,
  FiUsers,
  FiActivity,
} from "react-icons/fi";

const INSURANCE_TYPES = [
  {
    id: 0,
    name: "TNDS Bắt Buộc",
    shortName: "TNDS",
    description:
      "Bảo hiểm trách nhiệm dân sự bắt buộc theo quy định pháp luật. Bồi thường thiệt hại cho bên thứ ba bị tai nạn.",
    icon: FiShield,
    color: "blue",
    bg: "from-red-50 to-orange-50",
    text: "text-red-600",
    border: "border-red-200",
    glow: "from-red-600/5 to-orange-500/5",
    headerBg: "from-red-600 to-orange-600",
    pricing: [
      { loaiXe: "Xe máy (dưới 50cc)", gia: "0.001 ETH/năm" },
      { loaiXe: "Xe máy (trên 50cc)", gia: "0.0015 ETH/năm" },
      { loaiXe: "Ô tô con (dưới 6 chỗ)", gia: "0.005 ETH/năm" },
      { loaiXe: "Ô tô (7-15 chỗ)", gia: "0.007 ETH/năm" },
      { loaiXe: "Xe tải nhẹ", gia: "0.008 ETH/năm" },
    ],
    coverage: [
      "Thiệt hại thân thể bên thứ ba: tối đa 150 triệu VNĐ/người",
      "Thiệt hại tài sản bên thứ ba: tối đa 50 triệu VNĐ/vụ",
      "Chi phí y tế khẩn cấp",
      "Hỗ trợ pháp lý cơ bản",
    ],
    legalBasis: "Nghị định 03/2021/NĐ-CP",
    mandatory: true,
  },
  {
    id: 1,
    name: "Bảo Hiểm Vật Chất Xe",
    shortName: "Vật chất",
    description:
      "Bảo hiểm thiệt hại cho chính chiếc xe của bạn do tai nạn, va chạm, trộm cắp, thiên tai hoặc hỏa hoạn.",
    icon: FiTruck,
    color: "purple",
    bg: "from-purple-100 to-pink-100",
    text: "text-purple-600",
    border: "border-purple-200",
    glow: "from-purple-500/5 to-pink-500/5",
    headerBg: "from-purple-500 to-pink-600",
    pricing: [
      { loaiXe: "Xe máy", gia: "1.5% giá trị xe/năm" },
      { loaiXe: "Ô tô con", gia: "1.5% giá trị xe/năm" },
      { loaiXe: "Xe tải", gia: "1.8% giá trị xe/năm" },
      { loaiXe: "Xe chuyên dụng", gia: "2.0% giá trị xe/năm" },
    ],
    coverage: [
      "Thiệt hại thân vỏ xe do tai nạn, va chạm",
      "Mất trộm toàn bộ xe",
      "Thiệt hại do thiên tai: lũ lụt, bão, sét đánh",
      "Thiệt hại do hỏa hoạn, nổ",
      "Chi phí kéo xe đến garage sửa chữa",
    ],
    legalBasis: "Tự nguyện - Luật kinh doanh bảo hiểm",
    mandatory: false,
  },
  {
    id: 2,
    name: "Bảo Hiểm Người Trên Xe",
    shortName: "Người trên xe",
    description:
      "Bảo vệ tất cả hành khách ngồi trên xe khi xảy ra tai nạn giao thông. Bồi thường chi phí y tế và tử vong.",
    icon: FiUsers,
    color: "emerald",
    bg: "from-emerald-100 to-green-100",
    text: "text-emerald-600",
    border: "border-emerald-200",
    glow: "from-emerald-500/5 to-green-500/5",
    headerBg: "from-emerald-500 to-green-600",
    pricing: [
      { loaiXe: "Tất cả loại xe", gia: "0.002 ETH/người/năm" },
      { loaiXe: "Gói 4 người", gia: "0.007 ETH/năm" },
      { loaiXe: "Gói 7 người", gia: "0.012 ETH/năm" },
      { loaiXe: "Xe từ 8-15 người", gia: "0.002 ETH/người/năm" },
    ],
    coverage: [
      "Tử vong hoặc mất khả năng lao động vĩnh viễn: tối đa 50 triệu VNĐ",
      "Chi phí y tế điều trị tai nạn: tối đa 20 triệu VNĐ",
      "Phụ cấp nằm viện: 100.000 VNĐ/ngày",
      "Bồi thường thương tật tạm thời",
      "Áp dụng cho tất cả hành khách trên xe",
    ],
    legalBasis: "Tự nguyện - Thông tư 22/2016/TT-BTC",
    mandatory: false,
  },
  {
    id: 3,
    name: "Bảo Hiểm Tai Nạn Lái/Phụ Xe",
    shortName: "Lái & Phụ xe",
    description:
      "Bảo vệ lái xe và phụ xe chuyên nghiệp khi xảy ra tai nạn trong quá trình điều khiển phương tiện.",
    icon: FiActivity,
    color: "orange",
    bg: "from-orange-100 to-yellow-100",
    text: "text-orange-600",
    border: "border-orange-200",
    glow: "from-orange-500/5 to-yellow-500/5",
    headerBg: "from-orange-500 to-yellow-600",
    pricing: [
      { loaiXe: "Lái xe xe máy", gia: "0.001 ETH/năm" },
      { loaiXe: "Lái xe ô tô con", gia: "0.001 ETH/năm" },
      { loaiXe: "Lái xe tải/xe khách", gia: "0.0015 ETH/năm" },
      { loaiXe: "Gói lái + phụ xe", gia: "0.0025 ETH/năm" },
    ],
    coverage: [
      "Tử vong hoặc thương tật toàn bộ vĩnh viễn: tối đa 50 triệu VNĐ",
      "Thương tật bộ phận vĩnh viễn: theo tỷ lệ thương tật",
      "Chi phí y tế: tối đa 10 triệu VNĐ/vụ",
      "Trợ cấp phẫu thuật",
      "Áp dụng trong giờ làm việc và ngoài giờ",
    ],
    legalBasis: "Tự nguyện - Thông tư 22/2016/TT-BTC",
    mandatory: false,
  },
];

const getColorClasses = (color) => {
  const map = {
    blue: {
      bg: "from-red-50 to-orange-50",
      text: "text-red-600",
      border: "border-red-200",
      glow: "from-red-600/5 to-orange-500/5",
      badge: "bg-red-50 text-red-600 border-red-200",
      headerBg: "from-red-600 to-orange-600",
    },
    purple: {
      bg: "from-purple-50 to-pink-50",
      text: "text-purple-600",
      border: "border-purple-200",
      glow: "from-purple-500/5 to-pink-500/5",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      headerBg: "from-purple-500 to-pink-600",
    },
    emerald: {
      bg: "from-emerald-50 to-green-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      glow: "from-emerald-500/5 to-green-500/5",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      headerBg: "from-emerald-500 to-green-600",
    },
    orange: {
      bg: "from-orange-50 to-yellow-50",
      text: "text-orange-600",
      border: "border-orange-200",
      glow: "from-orange-500/5 to-yellow-500/5",
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      headerBg: "from-orange-500 to-yellow-600",
    },
  };
  return map[color] || map.blue;
};

const PlanManagement = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Thông Tin Sản Phẩm Bảo Hiểm
          </h2>
          <p className="text-gray-500">
            Danh mục các loại bảo hiểm xe cơ giới — giá và phạm vi bảo hiểm
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INSURANCE_TYPES.map((type) => {
          const colors = getColorClasses(type.color);
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className={`relative bg-white border ${colors.border} shadow-sm rounded-2xl p-4 overflow-hidden group hover:shadow-md transition-all duration-300 transform hover:scale-105`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                  className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${colors.glow} rounded-full blur-xl opacity-60`}
                ></div>
              </div>
              <div className="relative flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`h-5 w-5 ${colors.text}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${colors.text}`}>
                    Loại {type.id}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 leading-tight">
                    {type.shortName}
                  </p>
                </div>
              </div>
              {type.mandatory && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 text-red-400 border border-red-200">
                    Bắt buộc
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Insurance Type Detail Cards */}
      <div className="space-y-8">
        {INSURANCE_TYPES.map((type, index) => {
          const colors = getColorClasses(type.color);
          const Icon = type.icon;

          return (
            <div
              key={type.id}
              className="relative bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Elements */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div
                  className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.glow} rounded-full blur-2xl`}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br ${colors.glow} rounded-full blur-xl`}
                ></div>
              </div>

              {/* Card Header */}
              <div
                className={`relative bg-gradient-to-r ${colors.headerBg} px-8 py-6`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-xl font-bold text-white">
                          {type.name}
                        </h3>
                        {type.mandatory && (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-white/30 text-white border border-white/40">
                            Bắt buộc
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm font-medium">
                        Loại bảo hiểm {type.id} •{" "}
                        {type.legalBasis}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-sm font-medium mb-1">
                      Trạng thái
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold bg-white/20 text-white border border-white/30">
                      <span className="w-2 h-2 rounded-full bg-green-300 mr-2"></span>
                      Đang áp dụng
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="relative p-8">
                {/* Description */}
                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiInfo className={`h-5 w-5 ${colors.text}`} />
                    <h4 className="font-bold text-gray-900">Mô Tả</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {type.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Pricing Table */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FiDollarSign className={`h-5 w-5 ${colors.text}`} />
                      <h4 className="font-bold text-gray-900">Bảng Phí Bảo Hiểm</h4>
                    </div>
                    <div className="space-y-2">
                      {type.pricing.map((item, pIdx) => (
                        <div
                          key={pIdx}
                          className={`flex items-center justify-between p-3 bg-gray-50 border ${colors.border} rounded-xl hover:shadow-sm transition-all duration-200`}
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            {item.loaiXe}
                          </span>
                          <span className={`text-sm font-bold ${colors.text}`}>
                            {item.gia}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 italic">
                      * Phí có thể thay đổi theo từng đợt cập nhật hợp đồng
                    </p>
                  </div>

                  {/* Coverage */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FiShield className={`h-5 w-5 ${colors.text}`} />
                      <h4 className="font-bold text-gray-900">Phạm Vi Bảo Hiểm</h4>
                    </div>
                    <div className="space-y-2">
                      {type.coverage.map((item, cIdx) => (
                        <div
                          key={cIdx}
                          className={`flex items-start space-x-3 p-3 bg-gray-50 border ${colors.border} rounded-xl`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <div
                              className={`w-5 h-5 rounded-full bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center`}
                            >
                              <FiCheck className={`h-3 w-3 ${colors.text}`} />
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Information Panel */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-8 overflow-hidden">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <FiInfo className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-700 mb-4">
              Thông Tin Quan Trọng
            </h3>
            <div className="text-sm font-medium text-red-700 space-y-2">
              {[
                "Giá phí bảo hiểm được lập trình trong hợp đồng thông minh và không thể thay đổi tùy tiện",
                "TNDS Bắt buộc là loại bảo hiểm bắt buộc theo quy định pháp luật Việt Nam",
                "Các loại bảo hiểm khác là tự nguyện, có thể mua kèm theo để mở rộng bảo vệ",
                "Số tiền bồi thường tối đa phụ thuộc vào loại bảo hiểm và điều khoản hợp đồng",
                "Mọi thay đổi về phí và quy tắc bảo hiểm cần thực hiện qua nâng cấp hợp đồng thông minh",
                "Liên hệ đội ngũ kỹ thuật để cập nhật phí hoặc mở rộng loại bảo hiểm mới",
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-1.5 flex-shrink-0"></div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanManagement;







