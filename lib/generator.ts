import { countries, namesByCountry, CountryConfig } from '@/lib/countryData';

// 辅助函数:将字符转换为拉丁字母
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

// 高质量随机数生成(避免模式检测)
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

// 2. 生成生日 - 防检测版:模拟真实用户注册行为
export function generateBirthday() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Facebook 真实用户年龄分布(避免过于集中在某个年龄段)
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
  
  // 生日月份分布(避免过于集中)
  // 避开当前月份的前后1个月(降低"刚注册就生日"的异常)
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
  
  // 避免选择1号、15号、31号等"太整齐"的日期(人工痕迹)
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

// 3. 生成真实手机号(避免检测:使用真实运营商号段)
export function generatePhone(country: CountryConfig) {
  const code = country.code;
  let phone = '';

  switch (code) {
    case 'CN': // 中国移动/联通/电信真实号段
      const cnRealPrefixes = [
        '134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', // 移动
        '172', '178', '182', '183', '184', '187', '188', '198',
        '130', '131', '132', '145', '155', '156', '166', '171', '175', '176', '185', '186', // 联通
        '133', '149', '153', '173', '177', '180', '181', '189', '191', '199' // 电信
      ];
      const cnPrefix = cnRealPrefixes[secureRandom(0, cnRealPrefixes.length - 1)];
      phone = cnPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone}`;

    case 'HK': // 香港真实号段 (5, 6, 9 开头)
      const hkRealPrefixes = [
        '51', '52', '53', '54', '55', '56', '57', '59',
        '60', '61', '62', '63', '64', '65', '66', '67', '68', '69',
        '90', '91', '92', '93', '94', '95', '96', '97', '98'
      ];
      const hkPrefix = hkRealPrefixes[secureRandom(0, hkRealPrefixes.length - 1)];
      phone = hkPrefix + randomDigits(6); 
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4)}`;
    
    case 'MO': // 澳门 (6开头)
      const moPrefix = '6' + randomDigits(1, 2, 8); // 62, 63, 65, 66, 68
      phone = moPrefix + randomDigits(6);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4)}`;

    case 'TW': // 台湾 (09开头)
      const twPrefix = '9';
      phone = twPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'SG': // 新加坡 (8, 9 开头)
      const sgPrefixes = ['8', '9'];
      const sgPrefix = sgPrefixes[secureRandom(0, sgPrefixes.length - 1)];
      phone = sgPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4)}`;

    case 'US':
    case 'CA': // 北美真实区号 (排除 555 等虚假号段)
      const realAreaCodes = [
        '201', '202', '203', '205', '206', '209', '210', '212', '213', '214', '215', '219',
        '301', '302', '303', '304', '305', '310', '312', '313', '314', '315', '323',
        '401', '402', '404', '405', '407', '408', '410', '412', '415', '425',
        '503', '504', '505', '510', '512', '513', '516', '518',
        '602', '609', '610', '612', '614', '615', '617', '619', '626',
        '702', '703', '704', '708', '713', '714', '716', '718', '720', '727',
        '801', '803', '804', '805', '808', '813', '817', '818', '832', '858',
        '901', '904', '908', '909', '914', '916', '917', '919', '925', '949', '954', '972', '973'
      ];
      const areaCode = realAreaCodes[secureRandom(0, realAreaCodes.length - 1)];
      // NXX-XXXX, N=2-9
      const exchange = randomDigit(2, 9) + randomDigits(2);
      const subscriber = randomDigits(4);
      return `${country.phonePrefix} ${areaCode}-${exchange}-${subscriber}`;

    case 'GB': // 英国 (07开头, 排除 070 个人号码, 076 寻呼机)
      const gbPrefixes = ['71', '72', '73', '74', '75', '77', '78', '79'];
      const gbPrefix = gbPrefixes[secureRandom(0, gbPrefixes.length - 1)];
      phone = gbPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;

    case 'DE': // 德国 (015, 016, 017 开头)
      const dePrefixes = ['151', '152', '157', '159', '160', '162', '163', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179'];
      const dePrefix = dePrefixes[secureRandom(0, dePrefixes.length - 1)];
      phone = dePrefix + randomDigits(7); // 德国手机号通常总长10-11位(含0)
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3)}`;

    case 'FR': // 法国 (06, 07 开头)
      const frPrefixes = ['6', '7'];
      const frPrefix = frPrefixes[secureRandom(0, frPrefixes.length - 1)];
      phone = frPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 1)} ${phone.slice(1, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`;

    case 'IT': // 意大利 (3开头)
      const itPrefixes = ['320', '328', '329', '330', '331', '333', '334', '335', '336', '337', '338', '339', '340', '347', '348', '349', '360', '366', '368', '380', '388', '389', '390', '391', '392', '393'];
      const itPrefix = itPrefixes[secureRandom(0, itPrefixes.length - 1)];
      phone = itPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'ES': // 西班牙 (6, 7 开头)
      const esPrefixes = ['6', '7'];
      const esPrefix = esPrefixes[secureRandom(0, esPrefixes.length - 1)];
      phone = esPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`;

    case 'BR': // 巴西 (11位, 9开头)
      // 真实区号 (DDD)
      const brAreaCodes = ['11', '12', '13', '19', '21', '22', '24', '31', '32', '33', '35', '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54', '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73', '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88', '89', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
      const brArea = brAreaCodes[secureRandom(0, brAreaCodes.length - 1)];
      // 巴西手机号必须是 9 开头
      phone = brArea + '9' + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 2)} ${phone.slice(2, 7)}-${phone.slice(7)}`;

    case 'RU': // 俄罗斯 (9开头)
      const ruPrefix = '9' + randomDigits(2); // 9xx
      phone = ruPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)}-${phone.slice(6, 8)}-${phone.slice(8)}`;

    case 'IN': // 印度 (6, 7, 8, 9 开头)
      const inPrefixes = ['6', '7', '8', '9'];
      const inPrefix = inPrefixes[secureRandom(0, inPrefixes.length - 1)];
      phone = inPrefix + randomDigits(9);
      return `${country.phonePrefix} ${phone.slice(0, 5)} ${phone.slice(5)}`;

    case 'MX': // 墨西哥 (10位)
      const mxAreaCodes = ['55', '81', '33', '56']; // 常用: 墨西哥城, 蒙特雷, 瓜达拉哈拉
      const mxArea = mxAreaCodes[secureRandom(0, mxAreaCodes.length - 1)];
      phone = mxArea + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'NL': // 荷兰 (06 开头)
      phone = '6' + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 1)} ${phone.slice(1)}`;

    case 'SE': // 瑞典 (070, 072, 073, 076, 079)
      const sePrefixes = ['70', '72', '73', '76', '79'];
      const sePrefix = sePrefixes[secureRandom(0, sePrefixes.length - 1)];
      phone = sePrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 2)}-${phone.slice(2, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`;

    case 'CH': // 瑞士 (075, 076, 077, 078, 079)
      const chPrefixes = ['75', '76', '77', '78', '79'];
      const chPrefix = chPrefixes[secureRandom(0, chPrefixes.length - 1)];
      phone = chPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 7)} ${phone.slice(7)}`;

    case 'PL': // 波兰 (5, 6, 7, 8 开头)
      const plPrefixes = ['50', '51', '53', '57', '60', '66', '69', '72', '73', '78', '79', '88'];
      const plPrefix = plPrefixes[secureRandom(0, plPrefixes.length - 1)];
      phone = plPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'TR': // 土耳其 (5开头)
      const trPrefixes = ['501', '505', '506', '507', '530', '531', '532', '533', '534', '535', '536', '537', '538', '539', '540', '541', '542', '543', '544', '545', '546', '547', '548', '549', '551', '552', '553', '554', '555', '559'];
      const trPrefix = trPrefixes[secureRandom(0, trPrefixes.length - 1)];
      phone = trPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'JP': // 日本 (070, 080, 090)
      const jpPrefixes = ['90', '80', '70'];
      const jpPrefix = jpPrefixes[secureRandom(0, jpPrefixes.length - 1)];
      phone = jpPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`;

    case 'KR': // 韩国 (010 统一号段)
      phone = '10' + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 2)}-${phone.slice(2, 6)}-${phone.slice(6)}`;

    case 'VN': // 越南
      const vnPrefixes = [
        '86', '96', '97', '98', '32', '33', '34', '35', '36', '37', '38', '39', // Viettel
        '88', '91', '94', '83', '84', '85', // Vinaphone
        '89', '90', '93', '70', '79', '77', '76', '78' // Mobifone
      ];
      const vnPrefix = vnPrefixes[secureRandom(0, vnPrefixes.length - 1)];
      phone = vnPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'TH': // 泰国 (6, 8, 9 开头)
      const thPrefixes = ['6', '8', '9'];
      const thPrefix = thPrefixes[secureRandom(0, thPrefixes.length - 1)];
      phone = thPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5)}`;

    case 'ID': // 印尼 (8开头)
      const idPrefixes = ['811', '812', '813', '821', '822', '852', '853', '814', '815', '816', '855', '856', '857', '858', '817', '818', '819', '859', '877', '878'];
      const idPrefix = idPrefixes[secureRandom(0, idPrefixes.length - 1)];
      const idLength = secureRandom(7, 9); 
      phone = idPrefix + randomDigits(idLength);
      return `${country.phonePrefix} ${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;

    case 'PH': // 菲律宾 (9开头)
      const phPrefixes = ['905', '906', '915', '916', '917', '926', '927', '935', '936', '937', '945', '955', '956', '965', '966', '967', '975', '976', '977', '995', '996', '997', '907', '908', '909', '910', '911', '912', '913', '914', '918', '919', '920', '921', '922', '923', '924', '925', '928', '929', '930', '931', '932', '933', '934', '938', '939', '940', '941', '942', '943', '946', '947', '948', '949', '950', '951', '961', '963', '968', '970', '981', '989', '998', '999'];
      const phPrefix = phPrefixes[secureRandom(0, phPrefixes.length - 1)];
      phone = phPrefix + randomDigits(7);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    case 'MY': // 马来西亚 (10-19)
      const myPrefixes = ['10', '11', '12', '13', '14', '16', '17', '18', '19'];
      const myPrefix = myPrefixes[secureRandom(0, myPrefixes.length - 1)];
      // 011 是 11 位数(去掉0剩10位)，其他是 10 位数(去掉0剩9位)
      const myLen = myPrefix === '11' ? 8 : 7;
      phone = myPrefix + randomDigits(myLen);
      if (myPrefix === '11') {
        return `${country.phonePrefix} ${phone.slice(0, 3)}-${phone.slice(3)}`;
      }
      return `${country.phonePrefix} ${phone.slice(0, 2)}-${phone.slice(2, 5)} ${phone.slice(5)}`;

    case 'AU': // 澳洲 (4开头)
      phone = '4' + randomDigits(8);
      return `${country.phonePrefix} ${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;

    default: // 兜底逻辑
      phone = country.phoneFormat;
      while (phone.includes('X')) {
        phone = phone.replace('X', randomDigit().toString());
      }
      return `${country.phonePrefix} ${phone}`;
  }
}

// 4. 生成密码 - 防检测版:模拟人类密码习惯
export function generatePassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  
  // 模拟人类密码模式:
  // 1. 首字母大写
  // 2. 主体是小写字母+数字
  // 3. 结尾可能加特殊字符
  
  let password = '';
  
  // 首字母大写(60%概率)
  if (Math.random() < 0.6) {
    password += uppercase.charAt(secureRandom(0, uppercase.length - 1));
  } else {
    password += lowercase.charAt(secureRandom(0, lowercase.length - 1));
  }
  
  // 主体:5-7个小写字母
  const bodyLength = secureRandom(5, 7);
  for (let i = 0; i < bodyLength; i++) {
    password += lowercase.charAt(secureRandom(0, lowercase.length - 1));
  }
  
  // 数字:2-3个(通常是有意义的,如年份)
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
  
  // 特殊字符:50%概率在结尾加1个
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

// 6. 生成邮箱 - 防检测版:完全模拟真实用户邮箱习惯
export function generateEmail(firstName: string, lastName: string) {
  const domains = ["1xp.fr","cpc.cx","0cd.cn","ves.ink","q0.us.to","zx81.ovh","wishy.fr","blip.ovh","1nom.org","iya.fr.nf","sdj.fr.nf","afw.fr.nf","mynes.com","dao.pp.ua","lerch.ovh","six25.biz","ywzmb.top","isep.fr.nf","noreply.fr","pliz.fr.nf","noyp.fr.nf","zouz.fr.nf","hunnur.com","wxcv.fr.nf","zorg.fr.nf","imap.fr.nf","redi.fr.nf","dlvr.us.to","y.iotf.net","ym.cypi.fr","yop.too.li","dmts.fr.nf","binich.com","enpa.rf.gd","pochtac.ru","super.lgbt","jmail.fr.nf","yaloo.fr.nf","jinva.fr.nf","ealea.fr.nf","nomes.fr.nf","yop.kd2.org","alves.fr.nf","bibi.biz.st","bboys.fr.nf","ma.ezua.com","ma.zyns.com","mai.25u.com","autre.fr.nf","tweet.fr.nf","pamil.fr.nf","15963.fr.nf","popol.fr.nf","flobo.fr.nf","toolbox.ovh","bin-ich.com","sindwir.com","mabal.fr.nf","degap.fr.nf","yop.uuii.in","jetable.org","a.kwtest.io","cc.these.cc","gland.xxl.st","nospam.fr.nf","azeqsd.fr.nf","le.monchu.fr","nikora.fr.nf","sendos.fr.nf","cubox.biz.st","fhpfhp.fr.nf","c-eric.fr.nf","bahoo.biz.st","upc.infos.st","spam.aleh.de","alphax.fr.nf","habenwir.com","ist-hier.com","sind-wir.com","sindhier.com","wir-sind.com","myself.fr.nf","yop.mabox.eu","vip.ep77.com","druzik.pp.ua","flaimenet.ir","cloudsign.in","iuse.ydns.eu","get.vpn64.de","yahooz.xxl.st","altrans.fr.nf","yoptruc.fr.nf","kyuusei.fr.nf","certexx.fr.nf","dede.infos.st","yotmail.fr.nf","miloras.fr.nf","nikora.biz.st","cabiste.fr.nf","galaxim.fr.nf","pitiful.pp.ua","ggmail.biz.st","eooo.mooo.com","dis.hopto.org","yop.kyriog.fr","yop.mc-fly.be","tmp.x-lab.net","mail.hsmw.net","y.dldweb.info","haben-wir.com","sind-hier.com","assurmail.net","yop.smeux.com","alyxgod.rf.gd","mailadresi.tk","aze.kwtest.io","mailbox.biz.st","elmail.4pu.com","carioca.biz.st","mickaben.fr.nf","ac-malin.fr.nf","gimuemoa.fr.nf","woofidog.fr.nf","rygel.infos.st","contact.biz.st","rapidefr.fr.nf","calendro.fr.nf","calima.asso.st","cobal.infos.st","terre.infos.st","imails.asso.st","warlus.asso.st","carnesa.biz.st","mail.tbr.fr.nf","webstore.fr.nf","mr-email.fr.nf","abo-free.fr.nf","mailsafe.fr.nf","sirttest.us.to","yop.moolee.net","antispam.fr.nf","machen-wir.com","adresse.biz.st","poubelle.fr.nf","lacraffe.fr.nf","gladogmi.fr.nf","yopmail.ozm.fr","mail.yabes.ovh","totococo.fr.nf","miistermail.fr","yopmail.kro.kr","iamfrank.rf.gd","pooo.ooguy.com","get.route64.de","antispam.rf.gd","emocan.name.tr","freemail.biz.st","skynet.infos.st","readmail.biz.st","frostmail.fr.nf","pitimail.xxl.st","mickaben.biz.st","mickaben.xxl.st","internaut.us.to","poubelle-du.net","mondial.asso.st","randol.infos.st","himail.infos.st","sendos.infos.st","nidokela.biz.st","likeageek.fr.nf","mcdomaine.fr.nf","emaildark.fr.nf","cookie007.fr.nf","tagara.infos.st","pokemons1.fr.nf","spam.quillet.eu","desfrenes.fr.nf","mymail.infos.st","mail.i-dork.com","mail.berwie.com","mesemails.fr.nf","dripzgaming.com","mymaildo.kro.kr","dann.mywire.org","tivo.camdvr.org","tshirtsavvy.com","mymailbox.xxl.st","mail.xstyled.net","dreamgreen.fr.nf","contact.infos.st","mess-mails.fr.nf","omicron.token.ro","torrent411.fr.nf","test.inclick.net","ssi-bsn.infos.st","webclub.infos.st","vigilantkeep.net","actarus.infos.st","whatagarbage.com","test-infos.fr.nf","mail-mario.fr.nf","ym.digi-value.fr","adresse.infos.st","ypmail.sehier.fr","pixelgagnant.net","m.tartinemoi.com","ggamess.42web.io","mail.nuox.eu.org","ma1l.duckdns.org","courriel.fr.nf","jetable.fr.nf","moncourrier.fr.nf","monemail.fr.nf","monmail.fr.nf","yopmail.com","yopmail.fr","yopmail.net"];
  const domain = domains[secureRandom(0, domains.length - 1)];
  
  const cleanFirstName = convertToLatinChars(firstName);
  const cleanLastName = convertToLatinChars(lastName);
  
  // 使用真实的出生年份
  const currentYear = new Date().getFullYear();
  const age = secureRandom(18, 65);
  const birthYear = currentYear - age;
  const shortYear = birthYear.toString().slice(-2);
  
  // 使用加密随机数生成唯一标识(更自然的数字范围)
  const uniqueNum = secureRandom(1, 999); // 1-999更自然
  const smallNum = secureRandom(1, 99);
  
  // 真实邮箱格式分布(基于数百万真实邮箱分析)
  const formatRandom = Math.random();
  let username: string;
  
  // 分隔符:点最常见
  const separator = Math.random() < 0.65 ? '.' : (Math.random() < 0.5 ? '_' : '');
  
  if (formatRandom < 0.28) {
    // 28%: firstname.lastname(最常见且最可信)
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
  
  // 长度控制(6-28字符最自然)
  if (username.length < 6) {
    username += smallNum;
  }
  if (username.length > 28) {
    username = username.substring(0, 28);
  }
  
  username = username.replace(/[._]+$/, '');
  
  return `${username}@${domain}`;
}