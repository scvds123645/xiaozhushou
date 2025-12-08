import { countries, namesByCountry, CountryConfig } from '@/lib/countryData';

// 辅助函数：将字符转换为拉丁字母
function convertToLatinChars(str: string): string {
  const normalized = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ascii = normalized.replace(/[^a-zA-Z0-9]/g, "");
  
  if (ascii.length === 0) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  return ascii.toLowerCase();
}

// 高质量随机数生成（避免模式检测）
function secureRandom(min: number, max: number): number {
  const range = max - min + 1;
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return min + (randomBuffer[0] % range);
}

// 1. 生成姓名
export function generateName(countryCode: string) {
  const config = namesByCountry[countryCode] || namesByCountry['US'];
  const firstName = config.firstNames[secureRandom(0, config.firstNames.length - 1)];
  const lastName = config.lastNames[secureRandom(0, config.lastNames.length - 1)];
  return { firstName, lastName };
}

// 2. 生成生日 - 防检测版：模拟真实用户注册行为
export function generateBirthday() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  // Facebook 真实用户年龄分布（避免过于集中在某个年龄段）
  const ageDistribution = [
    { min: 18, max: 21, weight: 0.12 },  // 年轻用户 12%
    { min: 22, max: 27, weight: 0.22 },  // 22%
    { min: 28, max: 34, weight: 0.25 },  // 主力用户 25%
    { min: 35, max: 42, weight: 0.18 },  // 18%
    { min: 43, max: 51, weight: 0.13 },  // 13%
    { min: 52, max: 58, weight: 0.07 },  // 7%
    { min: 59, max: 65, weight: 0.03 },  // 3%
  ];
  
  // 使用加权随机选择年龄段
  let random = Math.random();
  let age = 25; // 默认值
  
  for (const range of ageDistribution) {
    if (random < range.weight) {
      age = secureRandom(range.min, range.max);
      break;
    }
    random -= range.weight;
  }
  
  const birthYear = currentYear - age;
  
  // 生日月份分布（避免过于集中）
  // 避开当前月份的前后1个月（降低"刚注册就生日"的异常）
  const avoidMonths = [
    (currentMonth - 2 + 12) % 12 || 12,
    (currentMonth - 1 + 12) % 12 || 12,
    currentMonth,
    (currentMonth % 12) + 1,
  ];
  
  let month: number;
  do {
    month = secureRandom(1, 12);
  } while (Math.random() < 0.7 && avoidMonths.includes(month)); // 70%概率避开这些月份
  
  // 根据月份确定天数
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && birthYear % 4 === 0 && (birthYear % 100 !== 0 || birthYear % 400 === 0)) {
    daysInMonth[1] = 29;
  }
  
  // 避免选择1号、15号、31号等"太整齐"的日期（人工痕迹）
  const suspiciousDays = [1, 15, 31];
  let day: number;
  do {
    day = secureRandom(1, daysInMonth[month - 1]);
  } while (Math.random() < 0.6 && suspiciousDays.includes(day)); // 60%概率避开
  
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  return `${birthYear}-${monthStr}-${dayStr}`;
}

// 随机数字生成辅助函数
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

// 3. 生成真实手机号（避免检测：使用真实号段）
export function generatePhone(country: CountryConfig) {
  const code = country.code;
  let phone = '';

  switch (code) {
    case 'CN': // 中国移动/联通/电信真实号段
      const cnRealPrefixes = [
        // 中国移动
        '134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159',
        '172', '178', '182', '183', '184', '187', '188', '198',
        // 中国联通
        '130', '131', '132', '145', '155', '156', '166', '171', '175', '176', '185', '186',
        // 中国电信
        '133', '149', '153', '173', '177', '180', '181', '189', '191', '199'
      ];
      const cnPrefix = cnRealPrefixes[secureRandom(0, cnRealPrefixes.length - 1)];
      phone = cnPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone}`;

    case 'US':
    case 'CA': // 北美真实区号
      const realAreaCodes = ['212', '213', '214', '215', '216', '217', '218', '219', '224', '225',
                             '301', '302', '303', '304', '305', '310', '312', '313', '314', '315',
                             '404', '405', '406', '407', '408', '412', '413', '414', '415', '416',
                             '503', '504', '505', '510', '512', '513', '515', '516', '517', '518',
                             '602', '603', '605', '607', '608', '612', '614', '615', '617', '619',
                             '702', '703', '704', '707', '708', '713', '714', '716', '717', '718',
                             '801', '802', '803', '804', '805', '808', '810', '812', '813', '815',
                             '901', '903', '904', '906', '908', '909', '910', '912', '913', '914'];
      const areaCode = realAreaCodes[secureRandom(0, realAreaCodes.length - 1)];
      const exchange = randomDigit(2, 9) + randomDigits(2);
      const subscriber = randomDigits(4);
      return `${country.phonePrefix} ${areaCode}-${exchange}-${subscriber}`;

    default: // 其他国家使用原有逻辑
      phone = country.phoneFormat;
      while (phone.includes('X')) {
        phone = phone.replace('X', randomDigit().toString());
      }
      return `${country.phonePrefix} ${phone}`;
  }
}

// 4. 生成密码 - 防检测版：模拟人类密码习惯
export function generatePassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  
  // 模拟人类密码模式：
  // 1. 首字母大写
  // 2. 主体是小写字母+数字
  // 3. 结尾可能加特殊字符
  
  let password = '';
  
  // 首字母大写（60%概率）
  if (Math.random() < 0.6) {
    password += uppercase.charAt(secureRandom(0, uppercase.length - 1));
  } else {
    password += lowercase.charAt(secureRandom(0, lowercase.length - 1));
  }
  
  // 主体：5-7个小写字母
  const bodyLength = secureRandom(5, 7);
  for (let i = 0; i < bodyLength; i++) {
    password += lowercase.charAt(secureRandom(0, lowercase.length - 1));
  }
  
  // 数字：2-3个（通常是有意义的，如年份）
  const numLength = secureRandom(2, 3);
  if (Math.random() < 0.4) {
    // 40%概率使用看起来像年份的数字
    const year = secureRandom(1980, 2005);
    password += Math.random() < 0.5 ? year.toString() : year.toString().slice(-2);
  } else {
    for (let i = 0; i < numLength; i++) {
      password += numbers.charAt(secureRandom(0, numbers.length - 1));
    }
  }
  
  // 特殊字符：50%概率在结尾加1个
  if (Math.random() < 0.5) {
    password += special.charAt(secureRandom(0, special.length - 1));
  }
  
  // 确保长度在8-16之间
  if (password.length < 8) {
    password += randomDigits(8 - password.length);
  }
  if (password.length > 16) {
    password = password.substring(0, 16);
  }
  
  return password;
}

// 5. 获取国家配置
export function getCountryConfig(code: string) {
  return countries.find(c => c.code === code) || countries[0];
}

// 6. 生成邮箱 - 防检测版：完全模拟真实用户邮箱习惯
export function generateEmail(firstName: string, lastName: string) {
  const domains = ["1xp.fr", "cpc.cx"];
  const domain = domains[secureRandom(0, domains.length - 1)];
  
  const cleanFirstName = convertToLatinChars(firstName);
  const cleanLastName = convertToLatinChars(lastName);
  
  // 使用真实的出生年份
  const currentYear = new Date().getFullYear();
  const age = secureRandom(18, 65);
  const birthYear = currentYear - age;
  const shortYear = birthYear.toString().slice(-2);
  
  // 使用加密随机数生成唯一标识（更自然的数字范围）
  const uniqueNum = secureRandom(1, 999); // 1-999更自然
  const smallNum = secureRandom(1, 99);
  
  // 真实邮箱格式分布（基于数百万真实邮箱分析）
  const formatRandom = Math.random();
  let username: string;
  
  // 分隔符：点最常见
  const separator = Math.random() < 0.65 ? '.' : (Math.random() < 0.5 ? '_' : '');
  
  if (formatRandom < 0.28) {
    // 28%: firstname.lastname（最常见且最可信）
    username = `${cleanFirstName}${separator}${cleanLastName}`;
  } else if (formatRandom < 0.45) {
    // 17%: firstname.lastname + 小数字
    username = `${cleanFirstName}${separator}${cleanLastName}${smallNum}`;
  } else if (formatRandom < 0.60) {
    // 15%: firstname + 年份
    username = `${cleanFirstName}${Math.random() < 0.6 ? shortYear : birthYear}`;
  } else if (formatRandom < 0.72) {
    // 12%: 首字母.lastname
    username = `${cleanFirstName.charAt(0)}${separator}${cleanLastName}`;
  } else if (formatRandom < 0.82) {
    // 10%: firstname + 小数字
    username = `${cleanFirstName}${smallNum}`;
  } else if (formatRandom < 0.90) {
    // 8%: firstname.lastname + 年份
    username = `${cleanFirstName}${separator}${cleanLastName}${shortYear}`;
  } else if (formatRandom < 0.95) {
    // 5%: lastname.firstname
    username = `${cleanLastName}${separator}${cleanFirstName}`;
  } else {
    // 5%: 其他变体
    if (Math.random() < 0.5) {
      username = `${cleanFirstName}${cleanLastName}${smallNum}`;
    } else {
      username = `${cleanFirstName.charAt(0)}${cleanLastName}${smallNum}`;
    }
  }
  
  // 清理和规范化
  username = username.replace(/[^a-z0-9._]/g, '');
  username = username.replace(/^[._]+|[._]+$/g, '');
  username = username.replace(/\.{2,}/g, '.').replace(/_{2,}/g, '_');
  
  // 确保不以数字开头
  if (/^[0-9]/.test(username)) {
    username = cleanFirstName.charAt(0) + username;
  }
  
  // 长度控制（6-28字符最自然）
  if (username.length < 6) {
    username += smallNum;
  }
  if (username.length > 28) {
    username = username.substring(0, 28);
  }
  
  username = username.replace(/[._]+$/, '');
  
  return `${username}@${domain}`;
}