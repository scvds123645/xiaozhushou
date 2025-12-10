import { countries, namesByCountry, CountryConfig } from '@/lib/countryData';
import { DOMAINS } from '@/lib/domains';

// --- 静态常量定义 (内存优化：避免在函数调用时重复创建) ---

const LATIN_CHARS = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SPECIAL_CHARS = "!@#$%&*";
const COMMON_SPECIAL = "!@#$"; // 更常用的特殊字符

// 年龄分布权重
const AGE_DISTRIBUTION = [
  { min: 18, max: 19, weight: 0.20 },
  { min: 20, max: 21, weight: 0.25 },
  { min: 22, max: 23, weight: 0.30 },
  { min: 24, max: 25, weight: 0.25 },
];

// 手机号前缀数据
const CN_PREFIXES = ['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '172', '178', '182', '183', '184', '187', '188', '198', '130', '131', '132', '145', '155', '156', '166', '171', '175', '176', '185', '186', '133', '149', '153', '173', '177', '180', '181', '189', '191', '199'];
const HK_PREFIXES = ['5123', '5163', '5193', '5233', '5263', '5293', '5323', '5353', '5383', '5413', '5443', '5473', '5503', '5533', '5563', '5593', '5623', '5653', '5683', '5713', '9012', '9013', '9018', '9019', '9020', '9021', '9022', '9023', '9024', '9028'];
const US_AREA_CODES = ['212', '213', '214', '310', '312', '313', '404', '415', '510', '617', '702', '718', '801', '904'];

const DAYS_IN_MONTH_BASE = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const SUSPICIOUS_DAYS = [1, 15, 31];

// --- 辅助函数 ---

function convertToLatinChars(str: string): string {
  const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ascii = normalized.replace(/[^a-zA-Z0-9]/g, "");
  
  if (ascii.length === 0) {
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += LATIN_CHARS.charAt(Math.floor(Math.random() * LATIN_CHARS.length));
    }
    return result;
  }
  return ascii.toLowerCase();
}

function secureRandom(min: number, max: number): number {
  const range = max - min + 1;
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return min + (randomBuffer[0] % range);
}

function randomDigit(min: number = 0, max: number = 9): string {
  return secureRandom(min, max).toString();
}

function randomDigits(length: number, min: number = 0, max: number = 9): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomDigit(min, max);
  }
  return result;
}

// --- 导出函数 ---

export function generateName(countryCode: string) {
  const config = namesByCountry[countryCode] || namesByCountry['US'];
  const firstName = config.firstNames[secureRandom(0, config.firstNames.length - 1)];
  const lastName = config.lastNames[secureRandom(0, config.lastNames.length - 1)];
  return { firstName, lastName };
}

export function generateBirthday() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  let random = Math.random();
  let age = 22;
  
  for (const range of AGE_DISTRIBUTION) {
    if (random < range.weight) {
      age = secureRandom(range.min, range.max);
      break;
    }
    random -= range.weight;
  }
  
  const birthYear = currentYear - age;
  
  // 避免生成与当前日期过于接近的生日（看起来假）
  const avoidMonths = [
    (currentMonth - 2 + 12) % 12 || 12,
    (currentMonth - 1 + 12) % 12 || 12,
    currentMonth,
    (currentMonth % 12) + 1,
  ];
  
  let month: number;
  do {
    month = secureRandom(1, 12);
  } while (Math.random() < 0.7 && avoidMonths.includes(month));
  
  let maxDays = DAYS_IN_MONTH_BASE[month - 1];
  // 闰年检查
  if (month === 2 && birthYear % 4 === 0 && (birthYear % 100 !== 0 || birthYear % 400 === 0)) {
    maxDays = 29;
  }
  
  let day: number;
  do {
    day = secureRandom(1, maxDays);
  } while (Math.random() < 0.6 && SUSPICIOUS_DAYS.includes(day));
  
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  return `${birthYear}-${monthStr}-${dayStr}`;
}

export function generatePhone(country: CountryConfig) {
  const code = country.code;
  
  switch (code) {
    case 'CN':
      const cnPrefix = CN_PREFIXES[secureRandom(0, CN_PREFIXES.length - 1)];
      return `${country.phonePrefix} ${cnPrefix}${randomDigits(8)}`;

    case 'HK':
      const hkPrefix = HK_PREFIXES[secureRandom(0, HK_PREFIXES.length - 1)];
      return `${country.phonePrefix} ${hkPrefix}${randomDigits(4)}`;

    case 'US':
    case 'CA':
      const areaCode = US_AREA_CODES[secureRandom(0, US_AREA_CODES.length - 1)];
      const exchange = randomDigit(2, 9) + randomDigits(2);
      const subscriber = randomDigits(4);
      return `${country.phonePrefix} ${areaCode}-${exchange}-${subscriber}`;

    default:
      let phone = country.phoneFormat;
      // 优化：使用正则替换比循环替换性能更好
      phone = phone.replace(/X/g, () => randomDigit().toString());
      return `${country.phonePrefix} ${phone}`;
  }
}

// 改进版密码生成函数
export function generatePassword() {
  const formatRandom = Math.random();
  
  // 格式1: 常见模式 - 首字母大写+字母+数字 (35%)
  if (formatRandom < 0.35) {
    let password = UPPERCASE.charAt(secureRandom(0, UPPERCASE.length - 1));
    
    const letterLength = secureRandom(5, 8);
    for (let i = 0; i < letterLength; i++) {
      password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
    }
    
    const numberLength = secureRandom(2, 4);
    for (let i = 0; i < numberLength; i++) {
      password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
    }
    
    // 30% 概率添加特殊字符
    if (Math.random() < 0.3) {
      password += COMMON_SPECIAL.charAt(secureRandom(0, COMMON_SPECIAL.length - 1));
    }
    
    return password;
  }
  
  // 格式2: 单词+年份+特殊字符 (25%)
  if (formatRandom < 0.60) {
    let password = '';
    
    // 首字母大写
    password += UPPERCASE.charAt(secureRandom(0, UPPERCASE.length - 1));
    
    // 5-7个小写字母
    const wordLength = secureRandom(5, 7);
    for (let i = 0; i < wordLength; i++) {
      password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
    }
    
    // 年份 (1985-2006 更广的范围)
    const year = secureRandom(1985, 2006);
    password += Math.random() < 0.6 ? year.toString() : year.toString().slice(-2);
    
    // 50% 概率添加特殊字符
    if (Math.random() < 0.5) {
      password += COMMON_SPECIAL.charAt(secureRandom(0, COMMON_SPECIAL.length - 1));
    }
    
    return password;
  }
  
  // 格式3: 混合模式 - 字母数字混合,特殊字符插入中间 (20%)
  if (formatRandom < 0.80) {
    let password = '';
    const totalLength = secureRandom(10, 14);
    
    // 首字母大写
    password += UPPERCASE.charAt(secureRandom(0, UPPERCASE.length - 1));
    
    const specialPosition = secureRandom(3, totalLength - 3); // 特殊字符插入中间位置
    
    for (let i = 1; i < totalLength; i++) {
      if (i === specialPosition && Math.random() < 0.4) {
        password += COMMON_SPECIAL.charAt(secureRandom(0, COMMON_SPECIAL.length - 1));
      } else if (Math.random() < 0.7) {
        password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
      } else {
        password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
      }
    }
    
    // 确保至少有2个数字
    let numCount = (password.match(/\d/g) || []).length;
    if (numCount < 2) {
      password = password.slice(0, -1) + NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
    }
    
    return password;
  }
  
  // 格式4: 两个单词组合 (15%)
  if (formatRandom < 0.95) {
    let password = '';
    
    // 第一个单词 (首字母大写)
    password += UPPERCASE.charAt(secureRandom(0, UPPERCASE.length - 1));
    const word1Length = secureRandom(3, 5);
    for (let i = 0; i < word1Length; i++) {
      password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
    }
    
    // 数字分隔
    const middleNumber = secureRandom(0, 99);
    password += middleNumber.toString();
    
    // 第二个单词 (首字母可能大写)
    if (Math.random() < 0.4) {
      password += UPPERCASE.charAt(secureRandom(0, UPPERCASE.length - 1));
    }
    const word2Length = secureRandom(3, 5);
    for (let i = 0; i < word2Length; i++) {
      password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
    }
    
    // 40% 概率添加特殊字符
    if (Math.random() < 0.4) {
      password += COMMON_SPECIAL.charAt(secureRandom(0, COMMON_SPECIAL.length - 1));
    }
    
    return password;
  }
  
  // 格式5: 全小写+数字+特殊字符 (5%)
  let password = '';
  const letterLength = secureRandom(6, 9);
  for (let i = 0; i < letterLength; i++) {
    password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
  }
  
  const numberLength = secureRandom(2, 3);
  for (let i = 0; i < numberLength; i++) {
    password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
  }
  
  // 60% 概率添加特殊字符
  if (Math.random() < 0.6) {
    password += SPECIAL_CHARS.charAt(secureRandom(0, SPECIAL_CHARS.length - 1));
  }
  
  // 长度限制
  if (password.length < 8) {
    password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
    password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
  }
  if (password.length > 16) {
    password = password.substring(0, 16);
  }
  
  return password;
}

export function getCountryConfig(code: string) {
  return countries.find(c => c.code === code) || countries[0];
}

// 优化：直接返回常量引用，不创建新数组
export function getAllDomains(): string[] {
  return DOMAINS;
}

export function generateEmail(firstName: string, lastName: string, customDomain?: string) {
  const cleanFirstName = convertToLatinChars(firstName);
  const cleanLastName = convertToLatinChars(lastName);
  
  const domain = customDomain || DOMAINS[secureRandom(0, DOMAINS.length - 1)];
  
  const currentYear = new Date().getFullYear();
  const age = secureRandom(18, 25);
  const birthYear = currentYear - age;
  const shortYear = birthYear.toString().slice(-2);
  
  const smallNum = secureRandom(1, 99);
  
  const formatRandom = Math.random();
  let username: string;
  
  const separator = Math.random() < 0.65 ? '.' : (Math.random() < 0.5 ? '_' : '');
  
  // 逻辑保持不变，但使用了优化后的常量
  if (formatRandom < 0.28) {
    username = `${cleanFirstName}${separator}${cleanLastName}`;
  } else if (formatRandom < 0.45) {
    username = `${cleanFirstName}${separator}${cleanLastName}${smallNum}`;
  } else if (formatRandom < 0.60) {
    username = `${cleanFirstName}${Math.random() < 0.6 ? shortYear : birthYear}`;
  } else if (formatRandom < 0.72) {
    username = `${cleanFirstName.charAt(0)}${separator}${cleanLastName}`;
  } else if (formatRandom < 0.82) {
    username = `${cleanFirstName}${smallNum}`;
  } else if (formatRandom < 0.90) {
    username = `${cleanFirstName}${separator}${cleanLastName}${shortYear}`;
  } else if (formatRandom < 0.95) {
    username = `${cleanLastName}${separator}${cleanFirstName}`;
  } else {
    if (Math.random() < 0.5) {
      username = `${cleanFirstName}${cleanLastName}${smallNum}`;
    } else {
      username = `${cleanFirstName.charAt(0)}${cleanLastName}${smallNum}`;
    }
  }
  
  username = username.replace(/[^a-z0-9._]/g, '');
  username = username.replace(/^[._]+|[._]+$/g, '');
  username = username.replace(/\.{2,}/g, '.').replace(/_{2,}/g, '_');
  
  if (/^[0-9]/.test(username)) {
    username = cleanFirstName.charAt(0) + username;
  }
  
  if (username.length < 6) {
    username += smallNum;
  }
  if (username.length > 28) {
    username = username.substring(0, 28);
  }
  
  username = username.replace(/[._]+$/, '');
  
  return `${username}@${domain}`;
}