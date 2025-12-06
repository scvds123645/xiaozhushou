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

// 将名字转换为拉丁字母 (只保留英文字母和数字)
function convertToLatinChars(name: string): string {
  // 中文拼音映射表 (常见姓名)
  const pinyinMap: Record<string, string> = {
    // 姓氏
    '王': 'wang', '李': 'li', '张': 'zhang', '刘': 'liu', '陈': 'chen', '杨': 'yang',
    '赵': 'zhao', '黄': 'huang', '周': 'zhou', '吴': 'wu', '徐': 'xu', '孙': 'sun',
    '胡': 'hu', '朱': 'zhu', '高': 'gao', '林': 'lin', '何': 'he', '郭': 'guo',
    '马': 'ma', '罗': 'luo', '梁': 'liang', '宋': 'song', '郑': 'zheng', '谢': 'xie',
    '韩': 'han', '唐': 'tang', '冯': 'feng', '于': 'yu', '董': 'dong', '萧': 'xiao',
    // 常见名字
    '伟': 'wei', '强': 'qiang', '磊': 'lei', '军': 'jun', '波': 'bo', '涛': 'tao',
    '超': 'chao', '勇': 'yong', '杰': 'jie', '鹏': 'peng', '浩': 'hao', '亮': 'liang',
    '芳': 'fang', '娜': 'na', '秀英': 'xiuying', '敏': 'min', '静': 'jing', '丽': 'li',
    '强': 'qiang', '艳': 'yan', '秀兰': 'xiulan', '莉': 'li', '玲': 'ling', '燕': 'yan',
    '宇': 'yu', '辉': 'hui', '刚': 'gang', '健': 'jian', '峰': 'feng', '建': 'jian',
    '明': 'ming', '俊': 'jun', '龙': 'long', '帅': 'shuai', '斌': 'bin', '凯': 'kai',
    '飞': 'fei', '文': 'wen', '华': 'hua', '志': 'zhi', '鑫': 'xin', '旭': 'xu',
  };

  // 如果已经是英文,直接返回小写并移除特殊字符
  if (/^[a-zA-Z\s]+$/.test(name)) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // 尝试转换中文
  let result = '';
  for (const char of name) {
    if (pinyinMap[char]) {
      result += pinyinMap[char];
    } else if (/[a-zA-Z0-9]/.test(char)) {
      result += char.toLowerCase();
    }
    // 忽略其他字符
  }

  // 如果转换失败,生成随机英文名
  if (!result || result.length < 2) {
    result = generateRealisticEnglishName(true).toLowerCase();
  }

  return result;
}

// 生成邮箱
export function generateEmail(firstName: string, lastName: string) {
  const domains = ["yopmail.com","00two.shop","00two.site","00xtwo.site","0cd.cn","123456.yopmail.com","15963.fr.nf","1nom.org","1xp.fr","20thmarvelcomics.com","3pati.cfd","41674.yopmail.com","713705.xyz","883.wishy.fr","aaa.veysem.pro","aad.veysem.pro","aae.veysem.pro","aaf.veysem.pro","aai.veysem.pro","aak.veysem.pro","aal.veysem.pro","aam.veysem.pro","aan.veysem.pro","aao.veysem.pro","aap.veysem.pro","aaq.veysem.pro","aar.veysem.pro","aas.veysem.pro","aat.veysem.pro","aau.veysem.pro","aav.veysem.pro","aaw.veysem.pro","aax.veysem.pro","aay.veysem.pro","aaz.veysem.pro","abc.yopmail.com","ab.kwtest.io","abo-free.fr.nf","abree.shop","accloud.click","accsell.vip","aceseria.site","ac-malin.fr.nf","acovi.click","ac.sensi.cloudns.be","actarus.infos.st","adgloselche.esmtp.biz","adobe.digiwav.store","adresse.biz.st","adresse.infos.st","aekie.top","aerohost.fun","aevun.click","afw.fr.nf","aifeo.fun","aikeno.fun","ainfan.fun","airairb.com","airem.space","airpurifierlab.com","aisee.online","aitoolsbox.website","ajumi.online","akivi.click","akupulsa.com","a.kwtest.io","aledrioroots.youdontcare.com","ali.yopmail.com","alphax.fr.nf","altrans.fr.nf","alves.fr.nf","alyspace.cfd","alyxgod.rf.gd","alzem.xyz","anchrisbaton.acmetoy.com","anfel.online","angisadevelopment.yopmail.com","anoiz.site","anreb.fun","antispam.fr.nf","antispam.rf.gd","anvee.fun","anviu.fun","anzem.fun","aonoi.top","aorne.online","aoroi.click","aqualesb.cfd","arios.click","ariun.site","arkhearts.space","aryue.click","asren.site","assurmail.net","ass.veysem.pro","asyon.site","ateblanc.icu","autre.fr.nf","autumnlab.fun","avilive.live","azab.duckdns.org","azdea.xyz","azeco.fun","aze.kwtest.io","azemo.xyz","azeqsd.fr.nf","bahoo.biz.st","bajihouppalle.shop","balva.online","bapratique.shop","batuparadise.com","bboys.fr.nf","bdsmporno.org","beixa.top","belaplus.com.br","belfo.top","bibi.biz.st","bibie.me","bicie.my.id","bifle.fr.nf","bin-ich.com","binich.com","bin.thomas-henon.fr","bitbox.my.id","bixmo.click","bizre.top","blavi.top","bleu.hopto.org","blip.ovh","bolzi.fun","bomau.top","bomoo.fun","bonmu.fun","boucheny.ovh","bounshnetwork.com","brafrannajufre.shop","brenz.asia","briendille.biz.id","brilo.fun","brinz.top","broubeiyitreboi2586.rest","bunfan.top","businesstool.store","byn.laurada.fr","cabiste.fr.nf","cacze.online","caene.asia","calendro.fr.nf","calima.asso.st","camoo.online","caowe.top","capcud.my.id","capcud.web.id","caramail.d3vs.net","careb.top","carioca.biz.st","cariri.gorgonoid.online","carnesa.biz.st","carze.online","catja.online","cattoigressagri3248.shop","cavee.top","cayoe.fun","cayre.fun","c-cenfirman.com","cc.these.cc","c-dominicfrance.com","cedea.top","cedix.xyz","cegetel.fr.nf","celfe.fun","celov.fun","cench.top","cende.fun","cenvo.click","c-eric.fr.nf","certexx.fr.nf","cervu.top","cewz.online","ceyone.click","cezem.top","chamedoon.cfd","chatlabs.it","chemail.us","chhhi.xyz","chiwo.online","choso.baby","christopherma.net","ciemo.top","cinoe.click","ciovo.top","circlegame.iceiy.com","ckmz.site","clavq.cfd","cleanandold.com","clickmada.xyz","cli.cloudns.cl","cloud.gaobo.org","cloudsign.in","clutunpodli.ddns.info","cmail.fr.nf","cmkc.homes","cmkg.beauty","cndlr.fun","coaz.site","cobal.infos.st","coizy.tech","colaiah.click","colopi.xyz","comau.fun","conmu.top","conoi.online","contact.biz.st","contact.braverli.com","contact.infos.st","cookie007.fr.nf","copitojad.com","coroi.fun","cotom.click","courriel.fr.nf","courrier.589.ca","covom.cfd","cozyborough.com","cpc.cx","creze.asia","ctly.site","cubox.biz.st","curef.cfd","cuxem.cfd","cydae.site","czennie.shop","dakoci.fun","dann.mywire.org","dao.pp.ua","daph.store","darty.biz.st","davru.top","dealgongmail.com","dealv.store","dede.infos.st","degap.fr.nf","deniq.shop","denoq.xyz","derok.top","desfrenes.fr.nf","dgse.infos.st","digitalmaster.fun","digiwav.store","digywav.store","dioscolwedddas.3-a.net","dis.hopto.org","dizmo.click","dlvr.us.to","dmts.fr.nf","doimi.click","doipoceiffefeu.shop","doktor-x.gq","dollcore.my.id","domvi.shop","donemail.my.id","donfo.fun","drafi.cfd","drako.cfd","dratvo.cfd","draxu.cfd","draxum.cfd","draxu.shop","dreamgreen.fr.nf","drilq.cfd","drilux.cfd","dripzgaming.com","dromiq.cfd","drovex.cfd","drqen.cfd","drunz.shop","druva.fun","druxel.cfd","druzik.pp.ua","dtpt.sg","dulfi.shop","dunro.xyz","dystluv.online","eads.cc","ealea.fr.nf","eczo.site","eivon.click","eizer.site","ekzei.top","elcoz.fun","elkout.com","elmail.4pu.com","elmen.click","elzem.click","email.1xp.fr","email.a51.fr","emaildark.fr.nf","emailspot.org","enfen.fun","enkio.fun","enpa.rf.gd","ensoe.click","eomze.click","eonei.uno","eooo.mooo.com","ernou.click","ervis.online","erzeo.site","esdev.fun","esiries.cloud","esmia.online","espun.click","etherxl.me","eucan.fun","evyn.fun","exmail.fun","extanewsmi.zzux.com","ezepi.fun","ezmen.info","ezore.online","ezoye.cfd","facturecolombia.info","fakemail.shop","fandee.fun","fanoi.top","fanzu.online","fapet.edu.pl","femdomfan.net","femdom-here.com","femqi.click","fenart.site","fensv.shop","fenval.online","fenve.fun","feqtra.online","fevon.top","fhpfhp.fr.nf","findz.my.id","fiorellahakie.yopmail.com","fj.fr","fjisfggroup.icu","flaimenet.ir","flalular.shop","fleurreines.com","flobo.fr.nf","florajuju.dedyn.io","floru.click","flyawaypigeon.net","foica.online","foktr.cfd","fomix.shop","fonbi.online","fonoi.fun","fpalehe.com","fr3e4ever.ddns.net","frakoyavopra.shop","frankpixel.store","frebix.click","free.exitnodes.uk","freemail.biz.st","freepromos.in","freepromos.info","frelk.shop","frezn.top","frint.top","fronq.click","frostmail.fr.nf","froza.click","fruzi.top","frylo.click","ftime.store","fulltv.win","funqer.online","fussionlabs.me","futke.shop","fylex.click","galaserv.fr","galaxim.fr.nf","galpe.shop","gandaiameiomart.online","gathelabuc.almostmy.com","gcaritos.top","gctech.top","gemanteres.shop","geniusstudio.tech","get.route64.de","get.vpn64.de","ggamess.42web.io","ggmail.biz.st","giantessa.net","gimuemoa.fr.nf","gladogmi.fr.nf","gland.xxl.st","globalinternet.fr.nf","gmaccess.space","gmaijoter.shop","gmail.yopmail.com","gmail.yopmail.fr","gmai.yopmail.com","gomra.top","gondemand.fr","gonse.online","good321.com","gous.live","govnoed.su","gralx.top","gratis-gratis.com","gratosmail.fr.nf","gravo.cfd","grazi.asia","grevi.top","guglemaul.shop","haben-wir.com","habenwir.com","hafabala.shop","halopere.shop","hanfe.top","havro.top","heavenofgaming.com","helsi.click","hen33.com","hgudovocroxoi8182.rest","hide.biz.st","himail.infos.st","hmmml.com","hotmail999.com","hotmaise.site","howbii.store","hrdfck.me","httpsblms.site","hunnur.com","hyperallergic.uk","iamfrank.rf.gd","icebi.click","idrizal.site","iicloud.com.vn","imails.asso.st","imap.fr.nf","imap.yopmail.com","imel.nextgenop.eu.org","inactiona.shop","inc.ovh","inenseti.shop","ingrok.win","internaut.us.to","iovee.fun","iryue.xyz","isep.fr.nf","ismarsofi.shop","isren.fun","ist-hier.com","istrisahnyafelix.my.id","ivome.fun","iya.fr.nf","izmun.click","jadeuvoikeloi9422.shop","janecart.click","janecart.shop","janeencalaway.com","javee.click","jazya.site","jeardamars.shop","jeime.fun","jeme.mastur.be","jeodumifi.ns3.name","jeone.online","jetable.fr.nf","jetable.org","jimael.com","jinva.fr.nf","jmail.fr.nf","jmas.site","jorginaldo.shop","jorzo.click","josubby.it","josubby.me","jota7shop.com.br","js11.top","jsmail.biz.st","jsmail.it","jude.yopmail.com","junex.fun","k4g.me","k7g.me","kalpi.shop","kathwld.store","katru.shop","kaxze.cfd","kazira.sbs","kazor.shop","kebab.my.id","keinth.xyz","kejy.top","kelmu.top","keluv.fun","kelva.cfd","kelvyo.site","kemulastalk.https443.org","kenbi.click","kenecrehand.port25.biz","keran.shop","kexvi.click","keysoftmail.store","kezlun.click","kiose.site","kiove.online","kiz.rip","klear.click","klenv.shop","knzora.com","kodekuh.xyz","koffe.tech","koica.top","kolfe.fun","komau.online","komoo.click","korun.shop","kosre.online","koswe.online","koutranosere9419.live","koyco.fun","krevo.top","kumachi.site","kuree.online","kyuusei.fr.nf","kzmta.xyz","lacraffe.fr.nf","lakoi.fun","larkwater.shop","laurenscmdt.asia","lazybird.site","le.monchu.fr","lerch.ovh","levanh.com","levanh.online","levanh.store","leysatuhell.sendsmtp.com","likeageek.fr.nf","likedog.sbs","lindaontheweb.com","linuxbp.free.nf","liprauppeittibra5377.shop","livie.cfd","livikyn.com","lonoi.click","lophe.top","lorvi.shop","louve.cfd","loverlake.site","lovexor.me","lunqer.online","lunxen.com","luvae.uno","luvlyth.cfd","luvmaeve.info","luvmeyri.space","lyaws.tech","ma1l.duckdns.org","mabal.fr.nf","ma-boite-aux-lettres.infos.st","machen-wir.com","machica.online","madea.cfd","ma.ezua.com","mai.25u.com","mail10s.top","mail.1secmail.my.id","mailadresi.tk","mail.berwie.com","mailbox.biz.st","mail.chaxiraxi.ch","mail.gigadu.de","mailhubpros.com","mail.i-dork.com","mail-imap.yopmail.com","mail.inforoca.ovh","mail.mailsnails.com","mail-mario.fr.nf","mailprohub.com","mailsafe.fr.nf","mailshopee.io.vn","mailsnails.com","mailsnd.shop","mail.tbr.fr.nf","mailtranhien.com","mailtranhien.online","mail.xstyled.net","mail.yabes.ovh","mail.yopmail.com","mailz.com.br","malqin.online","managmaius.shop","manuted.co","marde.click","marksandspencer.com.vn","masdjan.space","matrippaddoiquoi.shop","maunilleufetrei7462.shop","mavren.online","mavri.fun","mavtoq.online","ma.zyns.com","mccarts.cfd","mcdomaine.fr.nf","mean.gq","mecix.fun","megamail.fr.nf","mekie.xyz","mekro.fun","melbo.top","melfe.online","menagoogle.shop","menqos.online","mercadine.shop","merfe.fun","mes-emails.fr.nf","mesemails.fr.nf","mess-mails.fr.nf","mexar.xyz","mexze.fun","meyri.site","mezor.top","mickaben.biz.st","mickaben.fr.nf","mickaben.xxl.st","miefo.online","miene.click","miistermail.fr","miloras.fr.nf","mimco.click","mimoo.fun","minqer.online","miore.fun","miowe.online","miozo.site","mivar.fun","mivlos.online","mivqu.shop","mivro.click","mixmo.click","mizka.online","mkmouse.top","mktchv.biz","mmmv.ru","mocix.shop","moenze.cfd","moice.click","mokze.xyz","molfe.online","moltu.shop","molviri.online","moncourriel.fr.nf","moncourrier.fr.nf","mondial.asso.st","monemail.fr.nf","monmail.fr.nf","monsieurbiz.wtf","monvik.online","mopri.fun","mormi.online","mornu.click","moroi.online","mortmesttesre.wikaba.com","motom.cfd","mottel.fr","mozzu.online","mr-email.fr.nf","mspotify.com","m.tartinemoi.com","mufex.click","multeq.online","munqa.xyz","murom.fun","musoe.fun","muzchuvstv.store","mviq.ru","mwuffyn.cfd","mxeru.xyz","mymailbox.xxl.st","mymaildo.kro.kr","mymail.infos.st","mynes.com","myrxxx.site","myself.fr.nf","mzemo.cfd","napo.web.id","naree.fun","naxze.click","nayaz.click","nedea.fun","nekie.fun","nelocrerunnu1403.shop","nerze.site","netom.fun","nevro.fun","nguwawor.web.id","nidokela.biz.st","niezy.click","nikora.biz.st","nikora.fr.nf","nirqa.click","nizon.top","nocan.top","noclue.space","nofan.fun","nofileid.com","noiva.click","nokie.click","nomau.click","nomes.fr.nf","nonmu.fun","nonzo.online","noreply.fr","nospam.fr.nf","noxem.click","noyp.fr.nf","nucan.top","nufex.shop","nusoe.xyz","ochie.online","ocmun.fun","ohayo.uno","oldamz.com","olididas.shop","olzem.cfd","omicron.token.ro","omruu.online","oos.cloudns.be","opuraio.work.gd","orthocrypt.org","oryue.top","osvun.top","ounex.click","ovrie.online","oyimail.store","pafix.xyz","pamil.fr.nf","panahan.papamana.com","papki.shop","parleasalwebp.zyns.com","pecnou.click","pelfe.click","pelisservispremium.com","penzi.click","pepisonline.top","pereb.click","personaliter.shop","phuctdv.top","pigeon.vavo.be","pilax.xyz","pinepo.top","pitiful.pp.ua","pitimail.xxl.st","pixeelstore.store","pixelgagnant.net","pixelzon.store","piznu.xyz","playersmails.com","pleasehide.me","plixup.com","pliz.fr.nf","plorn.top","plowkids.com.br","pluvi.top","pochtac.ru","pokemons1.fr.nf","polfe.click","polloiddetike2653.shop","pooo.ooguy.com","pop3.yopmail.com","popol.fr.nf","porncomics.top","porsilapongo.cl","posvabotma.x24hr.com","poubelle-du.net","poubelle.fr.nf","poumo.fun","poy.e-paws.net","pozes.click","premthings.shop","present-hit.store","prettyshan.cfd","prewx.com","prostopochta.com","prucilluyitre6156.shop","prulo.top","psn-wallet.com","pulfex.click","punisher-1.one","punuq.xyz","purnix.online","qadru.shop","qandru.cfd","qandz.cfd","qarvex.cfd","qavix.cfd","qavol.shop","qebrix.click","qeltri.online","qelvo.click","qelvu.top","qemrox.online","qemtu.click","qerla.fun","qerlu.top","qesnu.site","qilra.click","qirvo.click","qolmi.click","qoltu.top","qornti.site","qorvim.cfd","qqb.veysem.pro","qqc.veysem.pro","qqe.veysem.pro","qqi.veysem.pro","qqm.veysem.pro","qqn.veysem.pro","qqo.veysem.pro","qqp.veysem.pro","qqq.veysem.pro","qqr.veysem.pro","qqt.veysem.pro","qqu.veysem.pro","qqv.veysem.pro","qqw.veysem.pro","qqx.veysem.pro","qqy.veysem.pro","qqz.veysem.pro","quden.xyz","quichebedext.freetcp.com","quinsy.cfd","qybru.click","qynex.click","qztri.click","rabopraussoppu2694.shop","raine.fun","raiseduki.me","randol.infos.st","rapidefr.fr.nf","rayibreuxenne.shop","rdsfs.icu","readmail.biz.st","redi.fr.nf","reiza.click","relvok.site","reox.fun","repula.gecigran.at","retep.com.au","retom.xyz","revom.xyz","revun.fun","rexvi.top","rexze.xyz","reyco.fun","reyon.site","riex.beauty","rilvex.site","rippoiteffocroi2229.shop","rivno.xyz","rizonchik.ru","roina.click","rongrongtu.cn","ronpy.site","routrebumuppi.shop","rovee.top","rozwe.online","rukal.shop","rvcosmic.site","rvone.click","rygel.infos.st","rzmun.xyz","s0.at","sabrestlouis.com","sacoi.shop","safrequoppevei.shop","safrol.site","sage.yopmail.com","sakaephong.us","samiu.shop","sanporeta.ddns.name","saove.top","saovta41.com","sareb.online","sarme.site","sasori.uno","sausetihenne.shop","scat-fantasy.com","scat-fantasy.net","scat-fetish.cc","scatporntube.cc","scattoilet.cc","scattube.cc","scina.fun","sdj.fr.nf","sdollv.lat","seanpogii-036392.yopmail.com","seena.online","sefan.click","selfe.fun","seloci.online","selqor.site","selrox.site","selro.xyz","sendos.fr.nf","sendos.infos.st","sen.se.dns-dynamic.net","senvel.online","seoye.fun","serbe.online","seriv.top","serveroutsource.net","sevun.online","sg.one.gb.net","sibro.cfd","sidn.ai","silvar.site","sind-hier.com","sindhier.com","sind-wir.com","sindwir.com","sing-me.store","siors.online","sirttest.us.to","sitex.fun","sivex.top","sivna.xyz","six25.biz","sixxsystem.store","skole.click","skunktest.work","skynet.infos.st","slowm.it","smartiuati.shop","smtp.yopmail.fr","snavo.cfd","socra.asia","soeca.fun","softpixel.store","softpix.store","soive.online","sokvim.site","solza.asia","somau.fun","somy.asia","sonoi.fun","soobin.cloud","sorcu.icu","soref.top","sorfia.com.br","soroi.top","soruz.click","sorvi.fun","souma.duckdns.org","sovom.click","sozes.online","spacibbacmo.lflink.com","spam.aleh.de","spam.kernel42.com","spam.lapoutre.net","spam.laymain.com","spam.quillet.eu","sponsstore.com","spotifans.club","spotifyreseller.biz","spotifyseller.co","srava.site","sreyi.online","srmun.shop","sruni.shop","sryue.cfd","ssi-bsn.infos.st","stavq.cfd","stelu.click","stoye.click","studioives.space","sucan.shop","sulov.fun","sumen.shop","super.lgbt","suppdiwaren.ddns.me.uk","surner.site","surni.click","suxem.top","szimo.click","szio.fun","tagara.infos.st","takayuki.cfd","takemewithu.me","takru.xyz","talver.online","tarvox.online","tavqir.click","tavqi.top","technologyis.online","techxs.dx.am","temp2.qwertz.me","tempmail.bearzi.it","tempmail.famee.it","temp.qwertz.me","teqol.xyz","terre.infos.st","test.actess.fr","tester2341.great-site.net","test.inclick.net","test-infos.fr.nf","tevro.click","tgmph.uno","tivo.camdvr.org","tivqa.xyz","tivro.xyz","tklsxxy.site","tmail.014.fr","tmp.qqu.be","tmp.raene.fr","tmp.world-of-ysera.com","tmp.x-lab.net","tonval.online","toolbox.ovh","toopitoo.com","torqem.click","torrent411.fr.nf","torvi.fun","totococo.fr.nf","tous-mes-mails.fr","tozes.top","tpaglucerne.dnset.com","tqerv.cfd","tqomi.xyz","tradingviewgiare.com","tragl.cfd","trakn.cfd","traodoinick.com","trelm.click","trevours.site","trevu.click","trevz.shop","trewo.cfd","trichic.com.br","trixieberry.shop","trmex.shop","trosmar.shop","trovin.click","trovi.top","troyaugoixudei.shop","trustenroll.com","tshirtsavvy.com","tulvi.shop","tuvqi.xyz","tweakacapun.wwwhost.biz","tweet.fr.nf","tyuublog.sbs","ucziak.cfd","ukey.ru","undergmail.net","upc.infos.st","urecloud.icu","uryue.fun","vakri.top","vamen.top","varaprasadh.dev","varzi.site","vaxlio.click","veiki.site","veilee.tk","velqon.site","velun.cfd","velvette.pro","vemiu.top","veolo.top","veoye.top","verifymail.iodomain883.wishy.fr","verom.top","ves.ink","vesoe.top","vetom.top","veusillodduse.shop","vexem.xyz","vexru.click","vexze.top","veysem.pro","vigilantkeep.net","vimun.top","vip.ep77.com","virek.click","vnkey.shop","voica.click","voine.top","vokva.xyz","vonen.fun","vonex.click","vonmu.online","voref.xyz","vorna.click","voroi.fun","voses.fun","votra.click","vouduvemmappau.shop","vovio.top","vrati.xyz","vraxu.cfd","vrens.click","vropin.click","vucan.xyz","vurni.top","vurnoq.site","vurns.shop","vuxra.xyz","vynoq.click","walopodes.shop","waltin.site","warix.shop","warlus.asso.st","waupaffugrobe9224.rest","wczo.online","webclub.infos.st","webstore.fr.nf","welrix.site","wermicorp.site","wexli.shop","wexni.fun","wexro.fun","whatagarbage.com","whattt.site","wirlex.site","wir-sind.com","wirten.site","wishy.fr","wixpor.site","wokniz.site","wolzed.site","womiu.click","womlez.site","wonfa.online","wonoi.asia","wonoi.fun","woofidog.fr.nf","woremi.site","woyen.fun","wozi.online","writershub.shop","wunqi.shop","wupqi.fun","wutri.fun","wwe.veysem.pro","wwp.veysem.pro","wwq.veysem.pro","wwr.veysem.pro","wwt.veysem.pro","www.veysem.pro","www.yopmail.com","wxcv.fr.nf","xalme.cfd","xapne.shop","xavru.xyz","xebro.fun","xedfocorp.site","xelpri.click","xelya.fun","xemlu.top","xeniahlly.xyz","xenpu.fun","xernq.shop","xevni.click","xevton.click","xevtu.top","xieno.click","xikemail.com","xilvor.click","ximra.top","xinco.site","xirvo.xyz","xmail.omnight.com","xonoi.click","xonpe.xyz","xoxoluv.site","xoxonics.shop","xrtex.top","xulpen.click","xurlo.xyz","xurme.xyz","xuvlen.click","xyeli.site","yahooz.xxl.st","yaloo.fr.nf","yasme.site","yawua.us","y.dldweb.info","yellow.org.in","yemrox.online","yemtra.online","yexma.online","yibore.icu","y.iotf.net","yitruq.online","y.lochou.fr","ymail.villien.net","ym.cypi.fr","ym.digi-value.fr","yocan.fun","yohmail.com","yolluyexabeu.shop","yolme.fun","yolmid.site","yoltu.top","yomiu.info","yop.codaspot.com","yop.emersion.fr","yop.fexp.io","yop.kyriog.fr","yop.mabox.eu","yopmail.fr","yopmail.kro.kr","yopmail.net","yopmail.ozm.fr","yop.mc-fly.be","yop.milter.int.eu.org","yop.moolee.net","yop.profmusique.com","yop.punkapoule.fr","yop.smeux.com","yop.too.li","yoptruc.fr.nf","yop.uuii.in","yop.work.gd","yop.xn--vqq79r59m.eu.org","yotmail.fr.nf","yotmir.online","yourmailtoday.com","ypmail.sehier.fr","yskganda.org","yubee.space","yurko.fun","yurpex.site","yuzecroicrofei2636.live","yvrak.xyz","ywzmb.top","zadrun.cfd","zamoo.top","zanqir.cfd","zarduz.cfd","zarte.shop","zavmi.click","zawen.click","zebee.fun","zedea.click","zeden.click","zee5.news","zeivoe.click","zekro.click","zelfe.fun","zelfe.top","zelmi.click","zemen.fun","zemix.click","zenbri.online","zenko.top","zer02.cfd","zeref.fun","zerev.fun","zesco.click","zevun.top","zexem.fun","zeyra.site","zheraxynxie.cfd","ziche.online","zidre.xyz","zihugahebre1749.shop","zikio.top","zilop.xyz","zimeq.click","zimok.shop","zinfighkildo.ftpserver.biz","zione.click","zipio.top","ziufan.online","zivran.site","zmac.site","zmah.store","zmku.biz.id","zocen.fun","zocer.site","zodru.shop","zoica.fun","zokie.cfd","zoldan.cfd","zolfe.top","zoliv.xyz","zolmi.click","zonde.asia","zonlu.click","zonmu.click","zoom163.cyou","zoore.xyz","zorg.fr.nf","zosoe.cfd","zouz.fr.nf","zovori.click","zovtem.online","zqeli.click","zqorn.click","zresa.online","zucan.click","zunet.xyz","zunra.top","zunvi.top","zurniu.site","zx81.ovh","zxcc.lol"];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  
  // 转换为拉丁字母 (只保留英文字母和数字)
  const cleanFirstName = convertToLatinChars(firstName);
  const cleanLastName = convertToLatinChars(lastName);
  
  // 如果名字太短,添加随机数字
  const needsNumber = cleanFirstName.length < 3 || cleanLastName.length < 2;
  const randomNum = needsNumber ? Math.floor(Math.random() * 1000) : Math.floor(Math.random() * 100);
  
  // 生成邮箱的多种格式 (只使用字母、数字和点号)
  const formats = [
    // firstname.lastname@
    `${cleanFirstName}.${cleanLastName}`,
    // firstnamelastname@
    `${cleanFirstName}${cleanLastName}`,
    // firstname.lastname + 数字@
    `${cleanFirstName}.${cleanLastName}${randomNum}`,
    // firstname + 数字@
    `${cleanFirstName}${randomNum}`,
    // firstname.initial@
    `${cleanFirstName}.${cleanLastName.charAt(0)}`,
    // initial.lastname@
    `${cleanFirstName.charAt(0)}.${cleanLastName}`,
    // lastname.firstname@
    `${cleanLastName}.${cleanFirstName}`,
    // firstname.lastname.数字@
    `${cleanFirstName}.${cleanLastName}.${Math.floor(Math.random() * 10)}`,
  ];
  
  // 随机选择一种格式
  let username = formats[Math.floor(Math.random() * formats.length)];
  
  // 确保用户名不为空且长度合理
  if (!username || username.length < 3) {
    username = `${cleanFirstName}${cleanLastName}${Math.floor(Math.random() * 1000)}`;
  }
  
  // 最终清理:确保只包含字母、数字和点号
  username = username.replace(/[^a-z0-9.]/g, '');
  
  // 确保不以点号开头或结尾
  username = username.replace(/^\.+|\.+$/g, '');
  
  // 确保没有连续的点号
  username = username.replace(/\.{2,}/g, '.');
  
  return `${username}@${domain}`;
}