import { countries, namesByCountry, CountryConfig } from '@/lib/countryData';
import { DOMAINS } from '@/lib/domains';

// --- 静态常量定义 (内存优化：避免在函数调用时重复创建) ---

const LATIN_CHARS = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SPECIAL_CHARS = "!@#$%&*";

// 常见的真实密码词汇
const COMMON_WORDS = [
  'love', 'life', 'star', 'moon', 'king', 'cool', 'super', 'happy', 'lucky', 'smart',
  'dream', 'angel', 'power', 'magic', 'light', 'dark', 'blue', 'fire', 'water', 'earth',
  'smile', 'peace', 'hope', 'faith', 'trust', 'grace', 'brave', 'strong', 'free', 'wild',
  'shine', 'gold', 'heart', 'soul', 'mind', 'time', 'wave', 'wind', 'rain', 'snow',
  'sun', 'sky', 'sea', 'ocean', 'storm', 'cloud', 'thunder', 'flash', 'spark', 'flame'
];

const COMMON_NUMBERS = ['123', '456', '789', '000', '111', '222', '321', '666', '888', '999'];

// 字符替换模式(leetspeak) - 真实用户常用
const LEET_REPLACEMENTS: Record<string, string[]> = {
  'a': ['@', '4'],
  'e': ['3'],
  'i': ['1', '!'],
  'o': ['0'],
  's': ['5', '$'],
  't': ['7'],
  'l': ['1'],
  'g': ['9']
};

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

function randomChoice<T>(array: T[]): T {
  return array[secureRandom(0, array.length - 1)];
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

function applyLeetSpeak(word: string, intensity: number = 0.3): string {
  let result = '';
  for (const char of word.toLowerCase()) {
    if (Math.random() < intensity && LEET_REPLACEMENTS[char]) {
      result += randomChoice(LEET_REPLACEMENTS[char]);
    } else {
      result += char;
    }
  }
  return result;
}

function capitalizeRandom(word: string): string {
  const chars = word.split('');
  const positions = [0]; // 至少首字母大写
  
  // 30% 概率随机大写其他位置
  if (Math.random() < 0.3 && chars.length > 2) {
    const pos = secureRandom(1, chars.length - 1);
    positions.push(pos);
  }
  
  return chars.map((c, i) => positions.includes(i) ? c.toUpperCase() : c).join('');
}

function generateRandomWord(length: number): string {
  let word = '';
  for (let i = 0; i < length; i++) {
    word += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
  }
  return word;
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

// 改进版密码生成函数 - 更贴近真实用户习惯
export function generatePassword(): string {
  const strategy = Math.random();
  
  // 策略1: 常见词 + 年份 + 可选特殊字符 (28%)
  // 例如: Love2000!, Happy1995, Star2002@
  if (strategy < 0.28) {
    const word = capitalizeRandom(randomChoice(COMMON_WORDS));
    const year = secureRandom(1990, 2006).toString();
    
    // 40% 概率添加特殊字符
    const special = Math.random() < 0.4 ? randomChoice(['!', '@', '#', '$', '&', '*']) : '';
    
    return word + year + special;
  }
  
  // 策略2: 常见词 + 常见数字组合 (22%)
  // 例如: Lucky123, Cool456!, Super789
  if (strategy < 0.50) {
    const word = capitalizeRandom(randomChoice(COMMON_WORDS));
    const nums = randomChoice(COMMON_NUMBERS);
    
    // 35% 概率添加特殊字符
    const special = Math.random() < 0.35 ? randomChoice(['!', '@', '#']) : '';
    
    return word + nums + special;
  }
  
  // 策略3: Leetspeak风格 (18%)
  // 例如: L0v3r123, Sm@rt456, C00l789!
  if (strategy < 0.68) {
    const word = randomChoice(COMMON_WORDS);
    const leetWord = applyLeetSpeak(word, 0.4);
    
    // 首字母大写
    const result = leetWord.charAt(0).toUpperCase() + leetWord.slice(1);
    
    // 添加数字
    const numLength = secureRandom(2, 3);
    let nums = '';
    for (let i = 0; i < numLength; i++) {
      nums += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
    }
    
    // 30% 概率添加特殊字符
    const special = Math.random() < 0.3 ? randomChoice(['!', '@', '#']) : '';
    
    return result + nums + special;
  }
  
  // 策略4: 两个单词组合 (15%)
  // 例如: LoveStar99, HappyLife2000, CoolKing123!
  if (strategy < 0.83) {
    const word1 = capitalizeRandom(randomChoice(COMMON_WORDS));
    const word2 = randomChoice(COMMON_WORDS);
    
    // 第二个词有50%概率首字母大写
    const finalWord2 = Math.random() < 0.5 ? 
      word2.charAt(0).toUpperCase() + word2.slice(1) : word2;
    
    // 添加数字(2-4位)
    const numLength = secureRandom(2, 4);
    let nums = '';
    for (let i = 0; i < numLength; i++) {
      nums += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
    }
    
    // 25% 概率添加特殊字符
    const special = Math.random() < 0.25 ? randomChoice(['!', '@', '#']) : '';
    
    return word1 + finalWord2 + nums + special;
  }
  
  // 策略5: 首字母大写 + 小写字母 + 数字 (12%)
  // 例如: Abcdefgh12, Qwertyu789, Zxcvbnm23
  if (strategy < 0.95) {
    let password = UPPERCASE.charAt(secureRandom(0, UPPERCASE.length - 1));
    
    // 5-8个小写字母
    const letterLength = secureRandom(5, 8);
    for (let i = 0; i < letterLength; i++) {
      password += LOWERCASE.charAt(secureRandom(0, LOWERCASE.length - 1));
    }
    
    // 2-3位数字
    const numLength = secureRandom(2, 3);
    for (let i = 0; i < numLength; i++) {
      password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
    }
    
    // 20% 概率添加特殊字符
    if (Math.random() < 0.2) {
      password += randomChoice(['!', '@', '#']);
    }
    
    return password;
  }
  
  // 策略6: 混合随机模式 (5%) - 兜底方案
  // 例如: Mk7p@ss2024, Tr5st!23, Hs9pe456
  let password = '';
  const baseWord = generateRandomWord(secureRandom(4, 6));
  password = capitalizeRandom(baseWord);
  
  // 轻度leetspeak
  password = applyLeetSpeak(password, 0.2);
  
  // 添加数字
  const numLength = secureRandom(2, 4);
  for (let i = 0; i < numLength; i++) {
    password += NUMBERS.charAt(secureRandom(0, NUMBERS.length - 1));
  }
  
  // 30% 概率添加特殊字符
  if (Math.random() < 0.3) {
    const pos = secureRandom(1, password.length);
    password = password.slice(0, pos) + randomChoice(['!', '@', '#']) + password.slice(pos);
  }
  
  // 长度检查
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