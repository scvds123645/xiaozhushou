export interface CountryConfig {  
  code: string;  
  name: string;  
  phonePrefix: string;  
  phoneFormat: string;  
}  
  
export const countries: CountryConfig[] = [  
  { code: 'CN', name: '中国', phonePrefix: '+86', phoneFormat: '1XXXXXXXXXX' },  
  { code: 'HK', name: '香港', phonePrefix: '+852', phoneFormat: 'XXXX XXXX' },  
  { code: 'TW', name: '台灣', phonePrefix: '+886', phoneFormat: '9XX XXX XXX' },  
  { code: 'MO', name: '澳門', phonePrefix: '+853', phoneFormat: '6XXX XXXX' },  
  { code: 'SG', name: '新加坡', phonePrefix: '+65', phoneFormat: 'XXXX XXXX' },  
  { code: 'US', name: '美国', phonePrefix: '+1', phoneFormat: 'XXX-XXX-XXXX' },  
  { code: 'JP', name: '日本', phonePrefix: '+81', phoneFormat: 'XX-XXXX-XXXX' },  
  { code: 'GB', name: '英国', phonePrefix: '+44', phoneFormat: '7XXX XXX XXX' },  
  { code: 'DE', name: '德国', phonePrefix: '+49', phoneFormat: '1XX XXXXXXX' },  
  { code: 'FR', name: '法国', phonePrefix: '+33', phoneFormat: 'X XX XX XX XX' },  
  { code: 'KR', name: '韩国', phonePrefix: '+82', phoneFormat: '10-XXXX-XXXX' },  
  { code: 'CA', name: '加拿大', phonePrefix: '+1', phoneFormat: 'XXX-XXX-XXXX' },  
  { code: 'AU', name: '澳大利亚', phonePrefix: '+61', phoneFormat: '4XX XXX XXX' },  
  { code: 'IT', name: '意大利', phonePrefix: '+39', phoneFormat: '3XX XXX XXXX' },  
  { code: 'ES', name: '西班牙', phonePrefix: '+34', phoneFormat: '6XX XX XX XX' },  
  { code: 'BR', name: '巴西', phonePrefix: '+55', phoneFormat: 'XX 9XXXX-XXXX' },  
  { code: 'RU', name: '俄罗斯', phonePrefix: '+7', phoneFormat: '9XX XXX-XX-XX' },  
  { code: 'IN', name: '印度', phonePrefix: '+91', phoneFormat: 'XXXXX XXXXX' },  
  { code: 'MX', name: '墨西哥', phonePrefix: '+52', phoneFormat: 'XXX XXX XXXX' },  
  { code: 'NL', name: '荷兰', phonePrefix: '+31', phoneFormat: '6 XXXXXXXX' },  
  { code: 'SE', name: '瑞典', phonePrefix: '+46', phoneFormat: '7X-XXX XX XX' },  
  { code: 'CH', name: '瑞士', phonePrefix: '+41', phoneFormat: '7X XXX XX XX' },  
  { code: 'PL', name: '波兰', phonePrefix: '+48', phoneFormat: 'XXX XXX XXX' },  
  { code: 'TR', name: '土耳其', phonePrefix: '+90', phoneFormat: '5XX XXX XX XX' },  
  { code: 'TH', name: '泰国', phonePrefix: '+66', phoneFormat: 'XX XXX XXXX' },  
  { code: 'MY', name: '马来西亚', phonePrefix: '+60', phoneFormat: '1X-XXX XXXX' },  
  { code: 'ID', name: '印度尼西亚', phonePrefix: '+62', phoneFormat: '8XX-XXX-XXXX' },  
  { code: 'PH', name: '菲律宾', phonePrefix: '+63', phoneFormat: '9XX XXX XXXX' },  
  { code: 'VN', name: '越南', phonePrefix: '+84', phoneFormat: 'XXX XXX XXXX' },  
];  
  
export const namesByCountry: Record<string, { firstNames: string[], lastNames: string[] }> = {  
  // 中国大陆 - 扩充至常用百家姓和热门名字
  CN: {  
    firstNames: [  
      '伟', '强', '磊', '军', '波', '涛', '超', '勇', '杰', '鹏',  
      '浩', '亮', '宇', '辉', '刚', '健', '峰', '建', '明', '勇',  
      '芳', '娜', '秀英', '敏', '静', '丽', '强', '艳', '秀兰', '莉',  
      '玲', '燕', '红', '霞', '梅', '婷', '雪', '倩', '琳', '慧',
      '子涵', '欣怡', '梓涵', '晨曦', '紫萱', '诗涵', '梦洁', '嘉怡', '佳宜', '梦琪',
      '浩宇', '浩然', '宇轩', '宇航', '梓豪', '子轩', '浩轩', '俊杰', '子豪', '博文',
      '一诺', '依诺', '欣妍', '雨桐', '雨婷', '语嫣', '可馨', '雨泽', '烨霖', '致远'
    ],  
    lastNames: [  
      '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',  
      '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',  
      '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
      '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
      '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎',
      '余', '潘', '杜', '戴', '夏', '钟', '汪', '田', '任', '姜'
    ],  
  },
  // 香港 - 扩充
  HK: {  
    firstNames: [  
      '志明', '家豪', '偉豪', '健華', '俊傑', '建華', '俊宏', '志偉', '家輝', '偉強',  
      '嘉欣', '詩雅', '詠琪', '美玲', '雅婷', '慧敏', '淑賢', '美華', '麗珍', '秀娟',
      '子謙', '家謙', '樂天', '卓楠', '浩然', '柏豪', '俊緯', '子軒', '宇軒', '家傑',
      '凱琳', '思敏', '惠儀', '嘉敏', '佩珊', '曉彤', '穎詩', '紫寧', '樂儀', '芷晴'
    ],  
    lastNames: [  
      '陳', '黃', '李', '林', '張', '吳', '劉', '梁', '鄭', '何',  
      '羅', '高', '葉', '朱', '鍾', '盧', '潘', '謝', '曾', '鄧',
      '馮', '蔡', '郭', '袁', '周', '許', '馬', '蘇', '余', '黎'
    ],  
  },
  // 台湾 - 扩充
  TW: {  
    firstNames: [  
      '志豪', '建宏', '家豪', '俊宏', '志偉', '宗翰', '宇翔', '承翰', '冠廷', '柏翰',  
      '淑芬', '雅婷', '怡君', '淑惠', '美玲', '佩珊', '雅雯', '欣怡', '詩涵', '靜怡',
      '冠宇', '家瑋', '承恩', '柏宏', '彥廷', '建志', '俊凱', '信宏', '彥宏', '品睿',
      '宜蓁', '佳穎', '郁婷', '詩婷', '鈺婷', '思妤', '凱莉', '依婷', '佩君', '筱涵'
    ],  
    lastNames: [  
      '陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊',  
      '鄭', '賴', '謝', '徐', '許', '何', '羅', '葉', '蘇', '周',
      '莊', '江', '吕', '彭', '卢', '曹', '魏', '沈', '方', '廖'
    ],  
  },
  // 澳门
  MO: {  
    firstNames: [  
      '志明', '嘉欣', '家豪', '詩雅', '偉豪', '詠琪', '健華', '美玲', '俊傑', '雅婷',  
      '建華', '淑賢', '志強', '慧敏', '德華', '美華', '家輝', '麗珍', '俊宏', '秀娟',
      '梓軒', '子朗', '浩然', '柏霖', '俊宇', '凱文', '家俊', '偉文', '志華', '國強'
    ],  
    lastNames: [  
      '陳', '黃', '李', '林', '張', '吳', '劉', '梁', '鄭', '何',  
      '羅', '高', '葉', '朱', '鍾', '盧', '潘', '謝', '曾', '鄧'  
    ],  
  },
  // 新加坡
  SG: {  
    firstNames: [  
      'Wei Ming', 'Jun Hao', 'Kai Wen', 'Jia Wei', 'Zhi Hao', 'Wei Jie', 'Jun Wei', 'Kai Yang',  
      'Hui Ling', 'Xin Yi', 'Ying Xuan', 'Li Ting', 'Mei Lin', 'Hui Min', 'Xin Hui', 'Ying Ying',
      'Aloysius', 'Benjamin', 'Clement', 'Desmond', 'Edmund', 'Fabian', 'Gabriel', 'Herman',
      'Agnes', 'Bernice', 'Charmaine', 'Daphne', 'Eileen', 'Felicia', 'Grace', 'Hazel'
    ],  
    lastNames: [  
      'Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua', 'Chan', 'Koh',  
      'Teo', 'Ang', 'Yeo', 'Low', 'Tay', 'Sim', 'Chia', 'Ho', 'Chong', 'Seah',
      'Khoo', 'Foo', 'Gwee', 'Lian', 'Neo', 'Poh', 'Quek', 'Soh', 'Toh', 'Wee'
    ],  
  },
  // 美国 - 大幅扩充
  US: {  
    firstNames: [  
      'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',  
      'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',  
      'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',  
      'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
      'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Timothy', 'Stephanie',
      'Jason', 'Rebecca', 'Edward', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen',
      'Gary', 'Amy', 'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
      'Larry', 'Pamela', 'Justin', 'Nicole', 'Scott', 'Emma', 'Brandon', 'Samantha', 'Benjamin', 'Katherine'
    ],  
    lastNames: [  
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',  
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',  
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
      'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
      'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
      'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes',
      'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper'
    ],  
  },
  // 英国 - 扩充
  GB: {  
    firstNames: [  
      'Oliver', 'George', 'Harry', 'Noah', 'Jack', 'Leo', 'Arthur', 'Muhammad', 'Oscar', 'Charlie',  
      'Olivia', 'Amelia', 'Isla', 'Ava', 'Mia', 'Ivy', 'Lily', 'Isabella', 'Rosie', 'Sophia',
      'Thomas', 'James', 'William', 'Henry', 'Alfie', 'Archie', 'Joshua', 'Freddie', 'Theo', 'Isaac',
      'Emily', 'Grace', 'Freya', 'Ella', 'Charlotte', 'Evie', 'Daisy', 'Alice', 'Florence', 'Sienna'
    ],  
    lastNames: [  
      'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts',  
      'Johnson', 'Lewis', 'Walker', 'Robinson', 'Wood', 'Thompson', 'Wright', 'Watson', 'Edwards', 'Hughes',
      'Green', 'Hall', 'Clarke', 'Burton', 'Harris', 'Cooper', 'King', 'Lee', 'Martin', 'Ward',
      'Turner', 'Hill', 'Phillips', 'Baker', 'Morris', 'Kelly', 'Simpson', 'Marshall', 'Collins', 'Bennett'
    ],  
  },
  DE: {  
    firstNames: [  
      'Maximilian', 'Alexander', 'Paul', 'Elias', 'Ben', 'Noah', 'Leon', 'Louis', 'Jonas', 'Felix',  
      'Marie', 'Sophie', 'Maria', 'Sophia', 'Emilia', 'Emma', 'Hannah', 'Anna', 'Mia', 'Luisa',
      'Lukas', 'Finn', 'Tim', 'Luis', 'Julian', 'Philipp', 'Jakob', 'David', 'Jan', 'Simon',
      'Lena', 'Leonie', 'Johanna', 'Laura', 'Nele', 'Lara', 'Sarah', 'Clara', 'Lina', 'Maja'
    ],  
    lastNames: [  
      'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',  
      'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
      'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier'
    ],  
  },
  FR: {  
    firstNames: [  
      'Gabriel', 'Léo', 'Raphaël', 'Arthur', 'Louis', 'Lucas', 'Adam', 'Jules', 'Hugo', 'Maël',  
      'Jade', 'Louise', 'Emma', 'Ambre', 'Alice', 'Alba', 'Rose', 'Anna', 'Mia', 'Romy',
      'Liam', 'Ethan', 'Paul', 'Nathan', 'Gabin', 'Sacha', 'Noah', 'Tom', 'Mohamed', 'Aaron',
      'Lina', 'Chloé', 'Léa', 'Léna', 'Mila', 'Inès', 'Julia', 'Agathe', 'Juliette', 'Zoé'
    ],  
    lastNames: [  
      'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent',  
      'Simon', 'Michel', 'Lefebvre', 'Leroy', 'Roux', 'David', 'Bertrand', 'Morel', 'Fournier', 'Girard',
      'Bonnet', 'Dupont', 'Lambert', 'Fontaine', 'Rousseau', 'Vincent', 'Muller', 'Lefevre', 'Faure', 'Andre'
    ],  
  },
  RU: {  
    firstNames: [  
      'Alexander', 'Mikhail', 'Maxim', 'Ivan', 'Artem', 'Dmitry', 'Daniil', 'Mark', 'Lev', 'Matvey',  
      'Sofia', 'Maria', 'Anna', 'Alice', 'Victoria', 'Polina', 'Eva', 'Elizaveta', 'Arina', 'Varvara',
      'Kirill', 'Ilya', 'Timofey', 'Roman', 'Andrey', 'Nikita', 'Egor', 'Fedor', 'Konstantin', 'Pavel',
      'Daria', 'Ksenia', 'Anastasia', 'Veronika', 'Ekaterina', 'Alexandra', 'Ulyana', 'Milana', 'Kira', 'Yana'
    ],  
    lastNames: [  
      'Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Vasilyev', 'Petrov', 'Sokolov', 'Mikhailov', 'Novikov', 'Fedorov',  
      'Morozov', 'Volkov', 'Alekseev', 'Lebedev', 'Semenov', 'Egorov', 'Pavlov', 'Kozlov', 'Stepanov', 'Nikolaev',
      'Orlov', 'Andreev', 'Makarov', 'Nikitin', 'Zakharov', 'Zaitsev', 'Solovyov', 'Borisov', 'Yakovlev', 'Grigoryev'
    ],  
  },
  JP: {  
    firstNames: [  
      '太郎', '一郎', '健太', '翔', '大輔', '健', '誠', '拓也', '大樹', '裕太',  
      '花子', '美咲', '桜', '結衣', '七海', '陽菜', '愛', '結菜', '美月', '莉子',
      '蓮', '湊', '陽翔', '樹', '悠真', '大翔', '朝陽', '颯太', '優', '春馬',
      '葵', '陽葵', '凛', '紬', '芽依', '澪', '心春', '杏', 'さくら', '美桜'
    ],  
    lastNames: [  
      '佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤',  
      '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水',
      '山崎', '森', '池田', '橋本', '阿部', '石川', '山下', '中島', '石井', '小川'
    ],  
  },  
  KR: {  
    firstNames: [  
      '민준', '서준', '예준', '도윤', '시우', '주원', '하준', '지호', '준서', '건우',  
      '서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지유', '지민',
      '우진', '선우', '서진', '유준', '연우', '현우', '준우', '지훈', '승우', '성현',
      '채원', '수아', '다은', '예은', '지아', '소율', '예린', '지원', '소윤', '서영'
    ],  
    lastNames: [  
      '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임',  
      '한', '오', '서', '신', '권', '황', '안', '송', '류', '전',
      '홍', '고', '문', '양', '손', '배', '백', '허', '유', '남'
    ],  
  },  
  // 越南 - 扩充
  VN: {  
    firstNames: [  
      'Minh', 'Khang', 'Phuc', 'Tuan', 'Hung', 'Quan', 'Huy', 'Dung', 'Khanh', 'Bao',  
      'Linh', 'Huong', 'Trang', 'Hoa', 'Anh', 'Ngoc', 'Phuong', 'Mai', 'Lan', 'Thu',
      'Duc', 'Nam', 'Hai', 'Hieu', 'Thang', 'Dat', 'Long', 'Hoang', 'Son', 'Cuong',
      'Huyen', 'Tam', 'Ha', 'Van', 'Thao', 'Tuyet', 'Nhung', 'Quynh', 'Yen', 'Nga'
    ],  
    lastNames: [  
      'Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Phan', 'Vu', 'Vo', 'Dang', 'Bui',
      'Do', 'Ho', 'Ngo', 'Duong', 'Ly', 'Doan', 'Truong', 'Dinh', 'Lam', 'Trinh'
    ],  
  },  
  // 泰国 - 扩充
  TH: {  
    firstNames: [  
      'Somchai', 'Somsak', 'Surasak', 'Prasit', 'Wichai', 'Sompong', 'Narong', 'Pradit', 'Suchart', 'Thawee',  
      'Somying', 'Siriporn', 'Saowanee', 'Sumalee', 'Siriwan', 'Pensri', 'Wilaiwan', 'Pimchanok', 'Rattana', 'Suchada',
      'Arthit', 'Chai', 'Kittisak', 'Nattapong', 'Sakda', 'Thanawat', 'Voravit', 'Wanchai', 'Yuttana', 'Teerapat',
      'Kanya', 'Malai', 'Nara', 'Orathai', 'Pornthip', 'Sunisa', 'Ubon', 'Wandee', 'Yaowalak', 'Anchalee'
    ],  
    lastNames: [  
      'Siriwat', 'Chaiyaporn', 'Rattanakorn', 'Phuangphiphat', 'Thongchai', 'Jaturong', 'Komsawat', 'Nithipong',  
      'Pattanasin', 'Raksanti', 'Suwannarat', 'Thanawat', 'Wongsuwan', 'Apiraksakul', 'Boonyarat', 'Chaiyanon',
      'Saetang', 'Saelee', 'Saewong', 'Saelim', 'Promsri', 'Kaewmanee', 'Srisuk', 'Intara', 'Maneewong', 'Suwan'
    ],  
  },  
  // 印度 - 扩充
  IN: {  
    firstNames: [  
      'Rahul', 'Amit', 'Raj', 'Rohan', 'Arjun', 'Vikram', 'Karan', 'Aditya', 'Ravi', 'Suresh',  
      'Priya', 'Anjali', 'Sneha', 'Pooja', 'Kavita', 'Neha', 'Ritu', 'Sunita', 'Anita', 'Preeti',
      'Sanjay', 'Vijay', 'Deepak', 'Manish', 'Anil', 'Sunil', 'Ajay', 'Vikas', 'Sandeep', 'Vishal',
      'Divya', 'Shweta', 'Megha', 'Swati', 'Richa', 'Poonam', 'Seema', 'Geeta', 'Rekha', 'Nisha'
    ],  
    lastNames: [  
      'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Joshi', 'Mehta',  
      'Desai', 'Shah', 'Kapoor', 'Chopra', 'Malhotra', 'Agarwal', 'Bansal', 'Goyal', 'Jain', 'Khanna',
      'Mishra', 'Yadav', 'Das', 'Nair', 'Kulkarni', 'Khan', 'Choudhary', 'Tiwari', 'Pandey', 'Saxena'
    ],  
  },
  // 印尼 - 扩充
  ID: {
    firstNames: [
      'Budi', 'Agus', 'Dwi', 'Eko', 'Adi', 'Putra', 'Rizky', 'Muhammad', 'Nur', 'Dian',
      'Siti', 'Sri', 'Dewi', 'Putri', 'Indah', 'Lestari', 'Ayu', 'Fitri', 'Ratna', 'Wati',
      'Bambang', 'Hendra', 'Joko', 'Yudi', 'Ari', 'Fajar', 'Bayu', 'Rudi', 'Iwan', 'Heri',
      'Rina', 'Nina', 'Sari', 'Yuni', 'Maya', 'Rini', 'Nita', 'Tuti', 'Lina', 'Ani'
    ],
    lastNames: [
      'Santoso', 'Susanto', 'Wijaya', 'Saputra', 'Hidayat', 'Kusuma', 'Pratama', 'Nugroho', 'Purnomo', 'Utomo',
      'Suryana', 'Setiawan', 'Kurniawan', 'Gunawan', 'Wibowo', 'Lestari', 'Handayani', 'Rahayu', 'Wahyuni', 'Astuti',
      'Siregar', 'Nasution', 'Lubis', 'Harahap', 'Hasibuan', 'Simanjuntak', 'Pasaribu', 'Sihombing', 'Sitorus', 'Manullang'
    ]
  },
  // 菲律宾 - 扩充
  PH: {
    firstNames: [
      'Jose', 'Juan', 'Mark', 'Michael', 'Angelo', 'Christian', 'John', 'Joshua', 'Reynante', 'Marlon',
      'Maria', 'Mary', 'Jennifer', 'Michelle', 'Jessica', 'Grace', 'Joy', 'Christine', 'Catherine', 'Angelica',
      'Ryan', 'Jason', 'Jeffrey', 'Dennis', 'Joel', 'Richard', 'Eric', 'Ronald', 'Albert', 'Eduardo',
      'Lovely', 'Princess', 'Honey', 'Precious', 'Sunshine', 'Maricel', 'Rowena', 'Sheryl', 'Melanie', 'Cherry'
    ],
    lastNames: [
      'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia', 'Mendoza', 'Torres', 'Tomas', 'Andrada',
      'Castillo', 'Flores', 'Villanueva', 'Ramos', 'Castro', 'Rivera', 'Aquino', 'Navarro', 'Salazar', 'Mercado',
      'Dela Cruz', 'Fernandez', 'Lopez', 'Gonzales', 'Rodriguez', 'Perez', 'Sanchez', 'Martinez', 'Gomez', 'Diaz'
    ]
  },
  // 其他国家使用美国名字作为后备
  CA: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  AU: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  IT: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  ES: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  BR: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  MX: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  NL: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  SE: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  CH: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  PL: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  TR: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
  MY: { firstNames: ['James', 'Mary', 'John', 'Patricia'], lastNames: ['Smith', 'Johnson', 'Williams'] },
};