import { countries, namesByCountry, CountryConfig } from './countryData';

// 真实手机号段数据
const phoneSegments: Record<string, string[]> = {
  // 中国大陆 - 真实号段
  CN: [
    // 中国移动
    '134', '135', '136', '137', '138', '139', '147', '148', '150', '151', '152', 
    '157', '158', '159', '172', '178', '182', '183', '184', '187', '188', '195', '197', '198',
    // 中国联通  
    '130', '131', '132', '145', '146', '155', '156', '166', '167', '171', '175', '176', '185', '186', '196',
    // 中国电信
    '133', '149', '153', '173', '174', '177', '180', '181', '189', '190', '191', '193', '199'
  ],
  
  // 香港 - 8位号码
  HK: ['5', '6', '9'], // 手机号以5/6/9开头
  
  // 台湾 - 9位号码(0开头)
  TW: ['09'], // 手机号以09开头
  
  // 澳门 - 8位号码
  MO: ['6'], // 手机号以6开头
  
  // 新加坡 - 8位号码
  SG: ['8', '9'], // 手机号以8/9开头
  
  // 美国 - 使用真实区号(NPA)
  US: [
    // 主要城市区号
    '212', '213', '214', '215', '216', '217', '218', '219', // 2开头
    '301', '302', '303', '304', '305', '307', '308', '309', '310', '312', '313', '314', '315', '316', '317', '318', '319', '320', // 3开头
    '401', '402', '404', '405', '406', '407', '408', '409', '410', '412', '413', '414', '415', '417', '419', // 4开头
    '501', '502', '503', '504', '505', '507', '508', '509', '510', '512', '513', '515', '516', '517', '518', '520', // 5开头
    '602', '603', '605', '606', '607', '608', '609', '610', '612', '614', '615', '616', '617', '618', '619', '620', // 6开头
    '701', '702', '703', '704', '706', '707', '708', '712', '713', '714', '715', '716', '717', '718', '719', '720', // 7开头
    '801', '802', '803', '804', '805', '806', '808', '810', '812', '813', '814', '815', '816', '817', '818', '828', // 8开头
    '901', '903', '904', '906', '907', '908', '909', '910', '912', '913', '914', '915', '916', '917', '918', '919', '920', '925', // 9开头
  ],
  
  // 日本
  JP: ['070', '080', '090'], // 日本手机号以070/080/090开头
  
  // 韩国
  KR: ['010'], // 韩国手机号以010开头
  
  // 加拿大 - 使用美国相同的NANP系统
  CA: [
    '204', '226', '236', '249', '250', '289', '306', '343', '365', '367', '403', '416', '418', 
    '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', 
    '639', '647', '672', '705', '709', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'
  ],
  
  // 澳大利亚
  AU: ['04'], // 澳大利亚手机号以04开头
  
  // 英国
  GB: ['07'], // 英国手机号以07开头
  
  // 德国
  DE: ['015', '016', '017'], // 德国手机号以015/016/017开头
  
  // 法国
  FR: ['06', '07'], // 法国手机号以06/07开头
  
  // 意大利
  IT: ['3'], // 意大利手机号以3开头
  
  // 西班牙
  ES: ['6', '7'], // 西班牙手机号以6/7开头
  
  // 巴西
  BR: ['9'], // 巴西手机号第一位是9
  
  // 俄罗斯
  RU: ['9'], // 俄罗斯手机号以9开头
  
  // 印度
  IN: ['6', '7', '8', '9'], // 印度手机号以6/7/8/9开头
  
  // 墨西哥
  MX: ['1'], // 墨西哥手机号以1开头(在区号后)
  
  // 泰国
  TH: ['06', '08', '09'], // 泰国手机号以06/08/09开头
  
  // 马来西亚
  MY: ['01'], // 马来西亚手机号以01开头
  
  // 印度尼西亚
  ID: ['08'], // 印尼手机号以08开头
  
  // 菲律宾
  PH: ['09'], // 菲律宾手机号以09开头
  
  // 越南
  VN: ['03', '05', '07', '08', '09'], // 越南手机号
};

// 获取国家配置
export function getCountryConfig(countryCode: string): CountryConfig {
  const country = countries.find(c => c.code === countryCode);
  
  if (!country) {
    console.warn(`未找到国家代码 ${countryCode} 的配置，使用美国作为默认`);
    return countries.find(c => c.code === 'US') || countries[0];
  }
  
  return country;
}

// 元音和辅音
const vowels = ['a', 'e', 'i', 'o', 'u'];
const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'];

// 常见的英文名开头组合
const nameStarts = [
  'Al', 'An', 'Ar', 'Ash', 'Ben', 'Bri', 'Cal', 'Car', 'Cha', 'Chr', 'Dan', 'Dav', 
  'El', 'Em', 'Er', 'Eth', 'Ev', 'Gab', 'Gr', 'Han', 'Har', 'Is', 'Jac', 'Jam', 
  'Jas', 'Jor', 'Josh', 'Jul', 'Kat', 'Kev', 'Kyl', 'Laur', 'Le', 'Li', 'Mad', 
  'Mar', 'Mat', 'Max', 'Mel', 'Mic', 'Nat', 'Nic', 'Ol', 'Pat', 'Ph', 'Rac', 
  'Rob', 'Ry', 'Sam', 'Sar', 'Sc', 'Sh', 'So', 'St', 'Tay', 'Th', 'Tim', 'Ty', 
  'Vic', 'Will', 'Zach'
];

// 常见的名字中间/结尾音节
const middleSyllables = [
  'a', 'an', 'ar', 'ba', 'bel', 'ber', 'ca', 'da', 'den', 'der', 'di', 'don', 
  'e', 'el', 'en', 'er', 'ett', 'i', 'ia', 'ie', 'in', 'la', 'le', 'li', 'lo', 
  'ly', 'ma', 'mi', 'na', 'nel', 'ni', 'o', 'ol', 'on', 'ra', 'ren', 'ri', 'ro', 
  'ry', 'sa', 'son', 'ta', 'ten', 'ter', 'ti', 'ton', 'va', 'ver', 'vi', 'vy'
];

const endingSyllables = [
  'a', 'ah', 'an', 'anda', 'ane', 'anna', 'belle', 'beth', 'ca', 'ce', 'cy', 'da', 
  'dan', 'den', 'der', 'don', 'e', 'el', 'ella', 'elle', 'en', 'er', 'ett', 'ette', 
  'ey', 'i', 'ia', 'ice', 'ie', 'in', 'ina', 'ine', 'ison', 'la', 'le', 'ley', 'li', 
  'lie', 'lin', 'line', 'lyn', 'lynn', 'ly', 'ma', 'mie', 'mine', 'mon', 'my', 'na', 
  'ne', 'ney', 'ni', 'nie', 'ny', 'o', 'on', 'ory', 'othy', 'ra', 'ren', 'rey', 'ri', 
  'rie', 'ron', 'rose', 'ry', 'sa', 'son', 'sy', 'ta', 'te', 'ter', 'than', 'thy', 
  'ton', 'tor', 'ty', 'ver', 'vin', 'ya', 'yl', 'yn', 'zzie'
];

// 生成逼真的英文名
function generateRealisticEnglishName(isFirstName: boolean = true): string {
  const nameLength = Math.random() < 0.7 ? 2 : 3;
  
  let name = '';
  name += nameStarts[Math.floor(Math.random() * nameStarts.length)];
  
  if (nameLength === 3) {
    name += middleSyllables[Math.floor(Math.random() * middleSyllables.length)];
  }
  
  name += endingSyllables[Math.floor(Math.random() * endingSyllables.length)];
  
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// 常见英文姓氏后缀
const lastNameEndings = [
  'son', 'ton', 'man', 'er', 'ing', 'ley', 'field', 'wood', 'ford', 'ham', 
  'berg', 'stein', 'land', 'worth', 'ridge', 'dale', 'mont', 'more', 'hart', 
  'well', 'brook', 'burn', 'by', 'holm', 'hurst'
];

const lastNameStarts = [
  'John', 'Will', 'Jack', 'Rob', 'Har', 'Cart', 'Wat', 'Thom', 'Rich', 'Ed', 
  'And', 'Pet', 'Ste', 'Mat', 'Mar', 'Mil', 'Wil', 'Tay', 'Mor', 'Gar', 
  'Gr', 'Wh', 'Br', 'Cl', 'Fr', 'Bl', 'St', 'Sh', 'Ch', 'Sm'
];

// 生成逼真的英文姓氏
function generateRealisticLastName(): string {
  const useEnding = Math.random() < 0.6;
  
  if (useEnding) {
    const start = lastNameStarts[Math.floor(Math.random() * lastNameStarts.length)];
    const ending = lastNameEndings[Math.floor(Math.random() * lastNameEndings.length)];
    return start + ending;
  } else {
    return nameStarts[Math.floor(Math.random() * nameStarts.length)] + 
           middleSyllables[Math.floor(Math.random() * middleSyllables.length)];
  }
}

// 生成姓名
export function generateName(countryCode: string) {
  const names = namesByCountry[countryCode];
  
  if (names) {
    const firstName = names.firstNames[Math.floor(Math.random() * names.firstNames.length)];
    const lastName = names.lastNames[Math.floor(Math.random() * names.lastNames.length)];
    return { firstName, lastName };
  }
  
  return {
    firstName: generateRealisticEnglishName(true),
    lastName: generateRealisticLastName()
  };
}

// 生成生日 (18-25岁)
export function generateBirthday() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  
  const minYear = currentYear - 25;
  const maxYear = currentYear - 18;
  
  let year = minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
  
  if (year === maxYear) {
    const month = Math.floor(Math.random() * currentMonth) + 1;
    let day;
    
    if (month === currentMonth) {
      day = Math.floor(Math.random() * currentDay) + 1;
    } else {
      day = Math.floor(Math.random() * 28) + 1;
    }
    
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 生成真实手机号
export function generatePhone(country: CountryConfig) {
  const segments = phoneSegments[country.code];
  
  if (!segments || segments.length === 0) {
    // 如果没有配置,使用原来的随机生成
    let phone = country.phoneFormat;
    for (let i = 0; i < phone.length; i++) {
      if (phone[i] === 'X') {
        phone = phone.substring(0, i) + Math.floor(Math.random() * 10) + phone.substring(i + 1);
      }
    }
    return country.phonePrefix + ' ' + phone;
  }
  
  // 随机选择一个真实号段
  const segment = segments[Math.floor(Math.random() * segments.length)];
  
  // 根据国家生成完整号码
  switch (country.code) {
    case 'CN': // 中国:11位(3位号段 + 8位)
      return country.phonePrefix + ' ' + segment + Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'HK': // 香港:8位
      return country.phonePrefix + ' ' + segment + Array(7).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'TW': // 台湾:10位(09 + 8位)
      return country.phonePrefix + ' ' + segment + Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'MO': // 澳门:8位
      return country.phonePrefix + ' ' + segment + Array(7).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'SG': // 新加坡:8位
      return country.phonePrefix + ' ' + segment + Array(7).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'US': // 美国:10位(3位区号 + 3位前缀 + 4位)
    case 'CA': // 加拿大:同美国
      // 区号(NPA): segment
      // 前缀(NXX): 2-9开头,后两位0-9
      const prefix = (Math.floor(Math.random() * 8) + 2).toString() + 
                    Math.floor(Math.random() * 10).toString() + 
                    Math.floor(Math.random() * 10).toString();
      // 后四位:任意
      const lineNumber = Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      return country.phonePrefix + ' ' + segment + '-' + prefix + '-' + lineNumber;
      
    case 'JP': // 日本:11位(070/080/090 + 8位)
      return country.phonePrefix + ' ' + segment + '-' + 
             Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('') + '-' +
             Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'KR': // 韩国:11位(010 + 8位)
      return country.phonePrefix + ' ' + segment + '-' + 
             Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('') + '-' +
             Array(4).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'AU': // 澳大利亚:10位(04 + 8位)
      return country.phonePrefix + ' ' + segment + 
             Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'GB': // 英国:11位(07 + 9位)
      return country.phonePrefix + ' ' + segment + 
             Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'DE': // 德国:11-12位
      return country.phonePrefix + ' ' + segment + 
             Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'FR': // 法国:10位
      return country.phonePrefix + ' ' + segment + 
             Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    case 'BR': // 巴西:11位
      return country.phonePrefix + ' ' + Math.floor(Math.random() * 90 + 10) + ' ' + 
             segment + Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
      
    default:
      // 其他国家使用原格式
      let phone = country.phoneFormat;
      for (let i = 0; i < phone.length; i++) {
        if (phone[i] === 'X') {
          phone = phone.substring(0, i) + Math.floor(Math.random() * 10) + phone.substring(i + 1);
        }
      }
      return country.phonePrefix + ' ' + phone;
  }
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