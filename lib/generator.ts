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

// 1. 生成姓名
export function generateName(countryCode: string) {
  const config = namesByCountry[countryCode] || namesByCountry['US'];
  const firstName = config.firstNames[Math.floor(Math.random() * config.firstNames.length)];
  const lastName = config.lastNames[Math.floor(Math.random() * config.lastNames.length)];
  return { firstName, lastName };
}

// 2. 生成生日 - 优化版：更真实的年龄分布
export function generateBirthday() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  // Facebook 实际用户年龄分布（2024年数据）
  // 18-24: 23%
  // 25-34: 31% (最大群体)
  // 35-44: 19%
  // 45-54: 14%
  // 55-64: 10%
  // 65+: 3%
  const random = Math.random();
  let age: number;
  
  if (random < 0.23) {
    age = Math.floor(Math.random() * 7) + 18; // 18-24
  } else if (random < 0.54) {
    age = Math.floor(Math.random() * 10) + 25; // 25-34
  } else if (random < 0.73) {
    age = Math.floor(Math.random() * 10) + 35; // 35-44
  } else if (random < 0.87) {
    age = Math.floor(Math.random() * 10) + 45; // 45-54
  } else if (random < 0.97) {
    age = Math.floor(Math.random() * 10) + 55; // 55-64
  } else {
    age = Math.floor(Math.random() * 5) + 65; // 65-69
  }
  
  const birthYear = currentYear - age;
  
  // 生成月份，避开当前月份前后（降低刚过生日概率）
  let month: number;
  const monthRandom = Math.random();
  if (monthRandom < 0.15) {
    // 15%概率是当前月份或下个月（即将过生日）
    month = currentMonth + Math.floor(Math.random() * 2);
    if (month > 12) month -= 12;
  } else {
    // 85%概率是其他月份
    month = Math.floor(Math.random() * 12) + 1;
    while (month === currentMonth || month === (currentMonth % 12) + 1) {
      month = Math.floor(Math.random() * 12) + 1;
    }
  }
  
  // 根据月份确定天数（考虑闰年）
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && birthYear % 4 === 0 && (birthYear % 100 !== 0 || birthYear % 400 === 0)) {
    daysInMonth[1] = 29;
  }
  
  // 避免生成今天的日期（如果是当前月份）
  let day = Math.floor(Math.random() * daysInMonth[month - 1]) + 1;
  if (month === currentMonth && day === currentDay) {
    day = (day % daysInMonth[month - 1]) + 1;
  }
  
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  return `${birthYear}-${monthStr}-${dayStr}`;
}

// 随机数字生成辅助函数
function randomDigit(min: number = 0, max: number = 9): string {
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

function randomDigits(length: number, min: number = 0, max: number = 9): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += randomDigit(min, max);
  }
  return result;
}

// 3. 生成真实手机号（保持原有逻辑）
export function generatePhone(country: CountryConfig) {
  const code = country.code;
  let phone = '';

  switch (code) {
    case 'CN':
      const cnPrefixes = ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
                          '47', '50', '51', '52', '53', '55', '56', '57', '58', '59',
                          '62', '65', '66', '67', '70', '71', '72', '75', '76', '77', '78',
                          '80', '81', '82', '83', '84', '85', '86', '87', '88', '89',
                          '90', '91', '92', '93', '95', '97', '98', '99'];
      phone = '1' + cnPrefixes[Math.floor(Math.random() * cnPrefixes.length)] + randomDigits(8);
      return `${country.phonePrefix} ${phone}`;

    case 'HK':
      const hkFirst = ['5', '6', '9'][Math.floor(Math.random() * 3)];
      phone = hkFirst + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4)}`;

    case 'TW':
      phone = '09' + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;

    case 'MO':
      phone = '6' + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4)}`;

    case 'SG':
      const sgFirst = ['8', '9'][Math.floor(Math.random() * 2)];
      phone = sgFirst + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4)}`;

    case 'US':
    case 'CA':
      const areaCode = randomDigit(2, 9) + randomDigits(2);
      const exchange = randomDigit(2, 9) + randomDigits(2);
      const subscriber = randomDigits(4);
      return `${country.phonePrefix} ${areaCode}-${exchange}-${subscriber}`;

    case 'JP':
      const jpPrefixes = ['70', '80', '90'];
      const jpPrefix = jpPrefixes[Math.floor(Math.random() * jpPrefixes.length)];
      phone = jpPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`;

    case 'GB':
      phone = '7' + randomDigits(9);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;

    default:
      phone = country.phoneFormat;
      while (phone.includes('X')) {
        phone = phone.replace('X', randomDigit().toString());
      }
      return `${country.phonePrefix} ${phone}`;
  }
}

// 4. 生成更强的密码
export function generatePassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";
  
  // 确保至少包含每种字符类型
  let password = '';
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));
  
  // 填充剩余字符
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = password.length; i < 12; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // 打乱顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// 5. 获取国家配置
export function getCountryConfig(code: string) {
  return countries.find(c => c.code === code) || countries[0];
}

// 6. 生成邮箱 - 优化版：更真实的格式
export function generateEmail(firstName: string, lastName: string) {
  const domains = ["1xp.fr", "cpc.cx"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  const cleanFirstName = convertToLatinChars(firstName);
  const cleanLastName = convertToLatinChars(lastName);
  
  // 使用真实的出生年份范围
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - (Math.floor(Math.random() * 47) + 18); // 18-65岁
  const shortYear = birthYear.toString().slice(-2);
  
  const separators = ['.', '_', ''];
  const sep = separators[Math.floor(Math.random() * separators.length)];
  
  // 更真实的邮箱格式分布
  const formatRandom = Math.random();
  let username: string;
  
  if (formatRandom < 0.35) {
    // 35%: firstname.lastname 或 lastname.firstname
    const order = Math.random() < 0.5;
    username = order ? `${cleanFirstName}${sep}${cleanLastName}` : `${cleanLastName}${sep}${cleanFirstName}`;
  } else if (formatRandom < 0.60) {
    // 25%: 加年份
    username = `${cleanFirstName}${sep}${cleanLastName}${Math.random() < 0.5 ? shortYear : birthYear}`;
  } else if (formatRandom < 0.75) {
    // 15%: 首字母缩写
    username = `${cleanFirstName.charAt(0)}${sep}${cleanLastName}`;
  } else if (formatRandom < 0.90) {
    // 15%: 加随机数字
    username = `${cleanFirstName}${cleanLastName}${Math.floor(Math.random() * 900) + 100}`;
  } else {
    // 10%: 其他格式
    username = `${cleanLastName.charAt(0)}${cleanFirstName}${Math.floor(Math.random() * 90) + 10}`;
  }
  
  // 清理特殊字符
  username = username.replace(/[^a-z0-9._]/g, '');
  username = username.replace(/^[._]+|[._]+$/g, '');
  username = username.replace(/\.{2,}/g, '.').replace(/_{2,}/g, '_');
  
  // 确保最小长度
  if (username.length < 5) {
    username += birthYear;
  }
  
  // 限制最大长度
  if (username.length > 30) {
    username = username.substring(0, 30);
  }
  
  return `${username}@${domain}`;
}