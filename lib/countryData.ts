export interface CountryConfig {
  code: string;
  name: string;
  phonePrefix: string;
  phoneFormat: string;
  flag: string;
}

export const countries: CountryConfig[] = [
  { code: 'CN', name: '中国', phonePrefix: '+86', phoneFormat: '1XXXXXXXXXX', flag: '🇨🇳' },
  { code: 'HK', name: '香港', phonePrefix: '+852', phoneFormat: 'XXXX XXXX', flag: '🇭🇰' },
  { code: 'TW', name: '台湾', phonePrefix: '+886', phoneFormat: 'XXXX XXX XXX', flag: '🇹🇼' },
  { code: 'MO', name: '澳门', phonePrefix: '+853', phoneFormat: 'XXXX XXXX', flag: '🇲🇴' },
  { code: 'SG', name: '新加坡', phonePrefix: '+65', phoneFormat: 'XXXX XXXX', flag: '🇸🇬' },
  { code: 'US', name: '美国', phonePrefix: '+1', phoneFormat: 'XXX-XXX-XXXX', flag: '🇺🇸' },
  { code: 'JP', name: '日本', phonePrefix: '+81', phoneFormat: 'XX-XXXX-XXXX', flag: '🇯🇵' },
  { code: 'GB', name: '英国', phonePrefix: '+44', phoneFormat: 'XXXX XXX XXX', flag: '🇬🇧' },
  { code: 'DE', name: '德国', phonePrefix: '+49', phoneFormat: 'XXX XXXXXXXX', flag: '🇩🇪' },
  { code: 'FR', name: '法国', phonePrefix: '+33', phoneFormat: 'X XX XX XX XX', flag: '🇫🇷' },
  { code: 'KR', name: '韩国', phonePrefix: '+82', phoneFormat: 'XX-XXXX-XXXX', flag: '🇰🇷' },
  { code: 'CA', name: '加拿大', phonePrefix: '+1', phoneFormat: 'XXX-XXX-XXXX', flag: '🇨🇦' },
  { code: 'AU', name: '澳大利亚', phonePrefix: '+61', phoneFormat: 'XXX XXX XXX', flag: '🇦🇺' },
  { code: 'IT', name: '意大利', phonePrefix: '+39', phoneFormat: 'XXX XXX XXXX', flag: '🇮🇹' },
  { code: 'ES', name: '西班牙', phonePrefix: '+34', phoneFormat: 'XXX XX XX XX', flag: '🇪🇸' },
  { code: 'BR', name: '巴西', phonePrefix: '+55', phoneFormat: 'XX XXXXX-XXXX', flag: '🇧🇷' },
  { code: 'RU', name: '俄罗斯', phonePrefix: '+7', phoneFormat: 'XXX XXX-XX-XX', flag: '🇷🇺' },
  { code: 'IN', name: '印度', phonePrefix: '+91', phoneFormat: 'XXXXX XXXXX', flag: '🇮🇳' },
  { code: 'MX', name: '墨西哥', phonePrefix: '+52', phoneFormat: 'XXX XXX XXXX', flag: '🇲🇽' },
  { code: 'NL', name: '荷兰', phonePrefix: '+31', phoneFormat: 'X XXXXXXXX', flag: '🇳🇱' },
  { code: 'SE', name: '瑞典', phonePrefix: '+46', phoneFormat: 'XX-XXX XX XX', flag: '🇸🇪' },
  { code: 'CH', name: '瑞士', phonePrefix: '+41', phoneFormat: 'XX XXX XX XX', flag: '🇨🇭' },
  { code: 'PL', name: '波兰', phonePrefix: '+48', phoneFormat: 'XXX XXX XXX', flag: '🇵🇱' },
  { code: 'TR', name: '土耳其', phonePrefix: '+90', phoneFormat: 'XXX XXX XX XX', flag: '🇹🇷' },
  { code: 'TH', name: '泰国', phonePrefix: '+66', phoneFormat: 'XX XXX XXXX', flag: '🇹🇭' },
  { code: 'MY', name: '马来西亚', phonePrefix: '+60', phoneFormat: 'XX-XXX XXXX', flag: '🇲🇾' },
  { code: 'ID', name: '印度尼西亚', phonePrefix: '+62', phoneFormat: 'XXX-XXX-XXXX', flag: '🇮🇩' },
  { code: 'PH', name: '菲律宾', phonePrefix: '+63', phoneFormat: 'XXX XXX XXXX', flag: '🇵🇭' },
  { code: 'VN', name: '越南', phonePrefix: '+84', phoneFormat: 'XXX XXX XXXX', flag: '🇻🇳' },
];

export const namesByCountry: Record<string, { firstNames: string[], lastNames: string[] }> = {
  CN: {
    firstNames: ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'],
    lastNames: ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'],
  },
  HK: {
    firstNames: ['志明', '嘉欣', '家豪', '诗雅', '伟豪', '咏琪', '健华', '美玲', '俊杰', '雅婷'],
    lastNames: ['陈', '黄', '李', '林', '张', '吴', '刘', '梁', '郑', '何'],
  },
  TW: {
    firstNames: ['志豪', '淑芬', '建宏', '雅婷', '家豪', '怡君', '俊宏', '淑惠', '志伟', '美玲'],
    lastNames: ['陈', '林', '黄', '张', '李', '王', '吴', '刘', '蔡', '杨'],
  },
  MO: {
    firstNames: ['志明', '嘉欣', '家豪', '诗雅', '伟豪', '咏琪', '健华', '美玲', '俊杰', '雅婷'],
    lastNames: ['陈', '黄', '李', '林', '张', '吴', '刘', '梁', '郑', '何'],
  },
  SG: {
    firstNames: ['Wei Ming', 'Hui Ling', 'Jun Hao', 'Xin Yi', 'Kai Wen', 'Ying Xuan', 'Jia Wei', 'Li Ting', 'Zhi Hao', 'Mei Lin'],
    lastNames: ['Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua', 'Chan', 'Koh'],
  },
  US: {
    firstNames: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'],
    lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'],
  },
  JP: {
    firstNames: ['太郎', '花子', '一郎', '美咲', '健太', 'さくら', '翔', '結衣', '大輔', '七海'],
    lastNames: ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤'],
  },
  // 其他国家使用英文名生成算法
};