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
    firstNames: [
      // 男性名字
      '伟', '强', '磊', '军', '波', '涛', '超', '勇', '杰', '鹏',
      '浩', '亮', '宇', '辉', '刚', '健', '峰', '建', '明', '勇',
      '俊', '龙', '帅', '斌', '凯', '飞', '文', '华', '志', '鑫',
      '旭', '洋', '阳', '东', '晨', '昊', '宁', '睿', '航', '轩',
      // 女性名字
      '芳', '娜', '秀英', '敏', '静', '丽', '强', '艳', '秀兰', '莉',
      '玲', '燕', '红', '霞', '梅', '婷', '雪', '倩', '琳', '慧',
      '萍', '颖', '怡', '佳', '晶', '雅', '兰', '洁', '菲', '欣',
      '瑶', '璐', '蕾', '薇', '娟', '珍', '凤', '爽', '青', '秀'
    ],
    lastNames: [
      '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
      '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
      '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
      '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
      '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎'
    ],
  },
  HK: {
    firstNames: [
      // 男性
      '志明', '家豪', '伟豪', '健华', '俊杰', '建华', '俊宏', '志伟', '家辉', '伟强',
      '德华', '学友', '家伦', '嘉豪', '俊文', '志强', '伟明', '建民', '志华', '家明',
      '国强', '文杰', '俊伟', '嘉诚', '子健', '浩然', '子轩', '梓豪', '俊熙', '宇轩',
      // 女性
      '嘉欣', '诗雅', '咏琪', '美玲', '雅婷', '慧敏', '淑贤', '美华', '丽珍', '秀娟',
      '思琪', '晓彤', '诗敏', '雅文', '诗婷', '美仪', '佩珊', '慧琳', '雪莹', '嘉怡',
      '梓晴', '雨桐', '欣怡', '诗琪', '晓雯', '佳慧', '心怡', '芷晴', '嘉雯', '雅诗'
    ],
    lastNames: [
      '陈', '黄', '李', '林', '张', '吴', '刘', '梁', '郑', '何',
      '罗', '高', '叶', '朱', '钟', '卢', '潘', '谢', '曾', '邓',
      '许', '苏', '袁', '唐', '杨', '冯', '蔡', '彭', '胡', '余',
      '赵', '徐', '周', '马', '谭', '韦', '丁', '孔', '贺', '廖'
    ],
  },
  TW: {
    firstNames: [
      // 男性
      '志豪', '建宏', '家豪', '俊宏', '志伟', '宗翰', '宇翔', '承翰', '冠廷', '柏翰',
      '建华', '明哲', '志强', '伟杰', '俊杰', '文博', '宇轩', '浩然', '子轩', '梓豪',
      '俊熙', '宇航', '博文', '天翔', '泽宇', '俊彦', '伟晨', '启航', '铭轩', '嘉豪',
      // 女性
      '淑芬', '雅婷', '怡君', '淑惠', '美玲', '佩珊', '雅雯', '欣怡', '诗涵', '静怡',
      '慧敏', '美华', '淑贤', '佳慧', '诗婷', '雅文', '晓彤', '雨桐', '芷晴', '心怡',
      '梓晴', '嘉怡', '思琪', '诗琪', '雅诗', '欣妍', '诗敏', '佩琪', '雅琪', '思妤'
    ],
    lastNames: [
      '陈', '林', '黄', '张', '李', '王', '吴', '刘', '蔡', '杨',
      '郑', '赖', '谢', '徐', '许', '何', '罗', '叶', '苏', '周',
      '庄', '江', '邱', '卓', '廖', '沈', '钟', '游', '温', '梁',
      '潘', '萧', '高', '胡', '曾', '彭', '邓', '曹', '田', '余'
    ],
  },
  MO: {
    firstNames: [
      '志明', '嘉欣', '家豪', '诗雅', '伟豪', '咏琪', '健华', '美玲', '俊杰', '雅婷',
      '建华', '淑贤', '志强', '慧敏', '德华', '美华', '家辉', '丽珍', '俊宏', '秀娟',
      '伟强', '思琪', '国强', '晓彤', '文杰', '诗敏', '俊伟', '雅文', '嘉诚', '诗婷',
    ],
    lastNames: [
      '陈', '黄', '李', '林', '张', '吴', '刘', '梁', '郑', '何',
      '罗', '高', '叶', '朱', '钟', '卢', '潘', '谢', '曾', '邓',
      '许', '苏', '袁', '唐', '杨', '冯', '蔡', '彭', '胡', '余'
    ],
  },
  SG: {
    firstNames: [
      // 男性
      'Wei Ming', 'Jun Hao', 'Kai Wen', 'Jia Wei', 'Zhi Hao', 'Wei Jie', 'Jun Wei', 'Kai Yang',
      'Zhi Yuan', 'Jun Xiang', 'Wei Xiang', 'Kai Xuan', 'Zhi Heng', 'Jun Kai', 'Wei Lun',
      'Kai Ming', 'Zhi Ming', 'Jun Yang', 'Wei Jian', 'Kai Rui', 'Zhi Xuan', 'Jun Rui',
      // 女性
      'Hui Ling', 'Xin Yi', 'Ying Xuan', 'Li Ting', 'Mei Lin', 'Hui Min', 'Xin Hui', 'Ying Ying',
      'Li Xuan', 'Mei Hui', 'Hui Xian', 'Xin Ru', 'Ying Qi', 'Li Yan', 'Mei Ling', 'Hui Qi',
      'Xin Yue', 'Ying Hui', 'Li Na', 'Mei Qi', 'Hui Wen', 'Xin Ying', 'Ying Xin', 'Li Hui'
    ],
    lastNames: [
      'Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua', 'Chan', 'Koh',
      'Teo', 'Ang', 'Yeo', 'Low', 'Tay', 'Sim', 'Chia', 'Ho', 'Chong', 'Seah',
      'Lau', 'Neo', 'Soh', 'Foo', 'Pang', 'Chew', 'Heng', 'Kang', 'Leong', 'Toh'
    ],
  },
  JP: {
    firstNames: [
      // 男性
      '太郎', '一郎', '健太', '翔', '大輔', '健', '誠', '拓也', '大樹', '裕太',
      '翔太', '隼人', '陽斗', '湊', '蒼', '悠斗', '碧', '樹', '颯', '陸',
      '蓮', '大和', '陽翔', '結翔', '朝陽', '颯太', '悠真', '陽向', '湊斗', '蒼空',
      // 女性
      '花子', '美咲', '桜', '結衣', '七海', '陽菜', '愛', '結菜', '美月', '莉子',
      '咲良', '優奈', '美羽', '凛', '心春', '葵', '結愛', '美桜', '陽葵', '杏',
      '心美', '莉愛', '穂花', '心愛', '美優', '明日香', '彩花', '真央', '菜々子', '舞'
    ],
    lastNames: [
      '佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤',
      '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
      '山崎', '森', '池田', '橋本', '阿部', '石川', '前田', '藤田', '岡田', '後藤',
      '長谷川', '村上', '近藤', '石井', '坂本', '遠藤', '青木', '藤井', '西村', '福田'
    ],
  },
  KR: {
    firstNames: [
      // 男性
      '민준', '서준', '예준', '도윤', '시우', '주원', '하준', '지호', '준서', '건우',
      '현우', '우진', '선우', '연우', '유준', '정우', '승우', '시윤', '민재', '현준',
      '지훈', '승현', '지우', '은우', '시후', '태양', '동현', '재윤', '윤호', '수호',
      // 女性
      '서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지유', '지민',
      '채원', '수아', '지아', '다은', '예은', '수빈', '소율', '예린', '채은', '유나',
      '은서', '가은', '민지', '예나', '서아', '지원', '아린', '유진', '나은', '지안'
    ],
    lastNames: [
      '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',
      '한', '오', '서', '신', '권', '황', '안', '송', '류', '전',
      '홍', '고', '문', '양', '손', '배', '백', '허', '남', '심'
    ],
  },
  VN: {
    firstNames: [
      // 男性
      'Minh', 'Khang', 'Phuc', 'Tuan', 'Hung', 'Quan', 'Huy', 'Dung', 'Khanh', 'Bao',
      'Hoang', 'Long', 'Nam', 'Hai', 'Cuong', 'Duc', 'Thanh', 'Vinh', 'Son', 'Dat',
      // 女性
      'Linh', 'Huong', 'Trang', 'Hoa', 'Anh', 'Ngoc', 'Phuong', 'Mai', 'Lan', 'Thu',
      'Thao', 'Yen', 'Nga', 'Van', 'Ha', 'Nhung', 'Hanh', 'Chi', 'Hang', 'Dieu'
    ],
    lastNames: [
      'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui',
      'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Dinh', 'Cao', 'Truong', 'Tang', 'Lam'
    ],
  },
  TH: {
    firstNames: [
      // 男性
      'Somchai', 'Somsak', 'Surasak', 'Prasit', 'Wichai', 'Sompong', 'Narong', 'Pradit', 'Suchart', 'Thawee',
      'Apirak', 'Chaiwat', 'Kittisak', 'Nattapong', 'Pornthep', 'Sitthichai', 'Tanawat', 'Watchara', 'Yuttana', 'Kornkiat',
      // 女性
      'Somying', 'Siriporn', 'Saowanee', 'Sumalee', 'Siriwan', 'Pensri', 'Wilaiwan', 'Pimchanok', 'Rattana', 'Suchada',
      'Anchana', 'Busaba', 'Chutima', 'Duangjai', 'Kamolwan', 'Naree', 'Patcharee', 'Ratree', 'Somjai', 'Wannee'
    ],
    lastNames: [
      'Siriwat', 'Chaiyaporn', 'Rattanakorn', 'Phuangphiphat', 'Thongchai', 'Jaturong', 'Komsawat', 'Nithipong',
      'Pattanasin', 'Raksanti', 'Suwannarat', 'Thanawat', 'Wongsuwan', 'Apiraksakul', 'Boonyarat', 'Chaiyanon'
    ],
  },
  IN: {
    firstNames: [
      // 男性
      'Rahul', 'Amit', 'Raj', 'Rohan', 'Arjun', 'Vikram', 'Karan', 'Aditya', 'Ravi', 'Suresh',
      'Akash', 'Ankit', 'Deepak', 'Gaurav', 'Harsh', 'Kunal', 'Mohit', 'Nikhil', 'Pranav', 'Sanjay',
      'Tarun', 'Varun', 'Yash', 'Abhishek', 'Ashish', 'Devesh', 'Kapil', 'Neeraj', 'Pradeep', 'Sandeep',
      // 女性
      'Priya', 'Anjali', 'Sneha', 'Pooja', 'Kavita', 'Neha', 'Ritu', 'Sunita', 'Anita', 'Preeti',
      'Aisha', 'Divya', 'Isha', 'Komal', 'Megha', 'Nisha', 'Pallavi', 'Rekha', 'Shweta', 'Tanya',
      'Varsha', 'Alka', 'Deepika', 'Geeta', 'Heena', 'Jyoti', 'Kiran', 'Monika', 'Payal', 'Sonia'
    ],
    lastNames: [
      'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Joshi', 'Mehta',
      'Desai', 'Shah', 'Kapoor', 'Chopra', 'Malhotra', 'Agarwal', 'Bansal', 'Goyal', 'Jain', 'Khanna',
      'Mishra', 'Pandey', 'Saxena', 'Srivastava', 'Trivedi', 'Yadav', 'Nair', 'Pillai', 'Menon', 'Iyer'
    ],
  },
};