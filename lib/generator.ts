import { countries, namesByCountry, CountryConfig } from './countryData';

// 元音和辅音
const vowels = 'aeiou';
const consonants = 'bcdfghjklmnpqrstvwxyz';

// 生成逼真的英文名（元音辅音交替）
export function generateEnglishName(length: number = 6): string {
  let name = '';
  const startWithVowel = Math.random() > 0.5;
  
  for (let i = 0; i < length; i++) {
    const useVowel = startWithVowel ? i % 2 === 0 : i % 2 !== 0;
    const chars = useVowel ? vowels : consonants;
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// 根据国家生成姓名
export function generateName(countryCode: string): { firstName: string; lastName: string } {
  const countryNames = namesByCountry[countryCode];
  
  if (countryNames) {
    return {
      firstName: countryNames.firstNames[Math.floor(Math.random() * countryNames.firstNames.length)],
      lastName: countryNames.lastNames[Math.floor(Math.random() * countryNames.lastNames.length)],
    };
  }
  
  // 默认生成英文名
  return {
    firstName: generateEnglishName(Math.floor(Math.random() * 3) + 5),
    lastName: generateEnglishName(Math.floor(Math.random() * 3) + 6),
  };
}

// 生成生日（18-25岁）
export function generateBirthday(): string {
  const today = new Date();
  const age = Math.floor(Math.random() * 8) + 18; // 18-25岁
  const year = today.getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // 简化处理,避免月份天数问题
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// 生成手机号
export function generatePhone(country: CountryConfig): string {
  const format = country.phoneFormat;
  let phone = '';
  
  for (const char of format) {
    if (char === 'X') {
      phone += Math.floor(Math.random() * 10);
    } else {
      phone += char;
    }
  }
  
  return country.phonePrefix + ' ' + phone;
}

// 生成强密码
export function generatePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = lowercase + uppercase + numbers + special;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < 16; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// 生成邮箱
export function generateEmail(firstName: string, lastName: string): string {
  const domains = ['yopmail.com', '00two.shop'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  return `${username}@${domain}`;
}

// 获取国家配置
export function getCountryConfig(code: string): CountryConfig {
  return countries.find(c => c.code === code) || countries[1]; // 默认美国
}