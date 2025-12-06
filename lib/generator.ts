// 请确保你的 generator.ts 中有这个函数，并且逻辑正确

import { countries, namesByCountry, CountryConfig } from './countryData';

// 获取国家配置
export function getCountryConfig(countryCode: string): CountryConfig {
  const country = countries.find(c => c.code === countryCode);
  
  if (!country) {
    console.warn(`未找到国家代码 ${countryCode} 的配置，使用美国作为默认`);
    // 如果找不到，返回美国
    return countries.find(c => c.code === 'US') || countries[0];
  }
  
  return country;
}

// 生成姓名
export function generateName(countryCode: string) {
  const names = namesByCountry[countryCode];
  
  if (names) {
    // 如果有该国家的名字数据，直接使用
    const firstName = names.firstNames[Math.floor(Math.random() * names.firstNames.length)];
    const lastName = names.lastNames[Math.floor(Math.random() * names.lastNames.length)];
    return { firstName, lastName };
  }
  
  // 否则生成英文名
  const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  return {
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
  };
}

// 生成生日
export function generateBirthday() {
  const year = 1960 + Math.floor(Math.random() * 45); // 1960-2005
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成手机号
export function generatePhone(country: CountryConfig) {
  let phone = country.phoneFormat;
  for (let i = 0; i < phone.length; i++) {
    if (phone[i] === 'X') {
      phone = phone.substring(0, i) + Math.floor(Math.random() * 10) + phone.substring(i + 1);
    }
  }
  return country.phonePrefix + ' ' + phone;
}

// 生成密码
export function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

// 生成邮箱
export function generateEmail(firstName: string, lastName: string) {
  const domains = ['yopmail.com', 'tempmail.com', 'guerrillamail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`;
  return `${username}@${domain}`;
}