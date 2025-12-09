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

// 高质量随机数生成
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

// 2. 生成生日 - 年龄限制在 18-25 岁
export function generateBirthday() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // ✅ 年龄分布:18-25 岁(年轻用户群体)
  const ageDistribution = [
    { min: 18, max: 19, weight: 0.20 },  // 18-19岁: 20%
    { min: 20, max: 21, weight: 0.25 },  // 20-21岁: 25%
    { min: 22, max: 23, weight: 0.30 },  // 22-23岁: 30% (主力)
    { min: 24, max: 25, weight: 0.25 },  // 24-25岁: 25%
  ];
  
  let random = Math.random();
  let age = 22; // 默认 22 岁
  
  for (const range of ageDistribution) {
    if (random < range.weight) {
      age = secureRandom(range.min, range.max);
      break;
    }
    random -= range.weight;
  }
  
  const birthYear = currentYear - age;
  
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
  
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && birthYear % 4 === 0 && (birthYear % 100 !== 0 || birthYear % 400 === 0)) {
    daysInMonth[1] = 29;
  }
  
  const suspiciousDays = [1, 15, 31];
  let day: number;
  do {
    day = secureRandom(1, daysInMonth[month - 1]);
  } while (Math.random() < 0.6 && suspiciousDays.includes(day));
  
  const monthStr = month.toString().padStart(2, '0');
  const dayStr = day.toString().padStart(2, '0');
  
  return `${birthYear}-${monthStr}-${dayStr}`;
}

// 随机数字生成
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

// 3. 生成手机号(保持原有逻辑,代码太长省略)
export function generatePhone(country: CountryConfig) {
  const code = country.code;
  let phone = '';

  switch (code) {
    case 'CN':
      const cnRealPrefixes = ['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '172', '178', '182', '183', '184', '187', '188', '198', '130', '131', '132', '145', '155', '156', '166', '171', '175', '176', '185', '186', '133', '149', '153', '173', '177', '180', '181', '189', '191', '199'];
      const cnPrefix = cnRealPrefixes[secureRandom(0, cnRealPrefixes.length - 1)];
      phone = cnPrefix + randomDigits(8);
      return `${country.phonePrefix} ${phone}`;

    case 'HK':
      const hkRealPrefixes = ['5123', '5163', '5193', '5233', '5263', '5293', '5323', '5353', '5383', '5413', '5443', '5473', '5503', '5533', '5563', '5593', '5623', '5653', '5683', '5713', '9012', '9013', '9018', '9019', '9020', '9021', '9022', '9023', '9024', '9028'];
      const hkPrefix = hkRealPrefixes[secureRandom(0, hkRealPrefixes.length - 1)];
      phone = hkPrefix + randomDigits(4);
      return `${country.phonePrefix} ${phone}`;

    case 'US':
    case 'CA':
      const realAreaCodes = ['212', '213', '214', '310', '312', '313', '404', '415', '510', '617', '702', '718', '801', '904'];
      const areaCode = realAreaCodes[secureRandom(0, realAreaCodes.length - 1)];
      const exchange = randomDigit(2, 9) + randomDigits(2);
      const subscriber = randomDigits(4);
      return `${country.phonePrefix} ${areaCode}-${exchange}-${subscriber}`;

    default:
      phone = country.phoneFormat;
      while (phone.includes('X')) {
        phone = phone.replace('X', randomDigit().toString());
      }
      return `${country.phonePrefix} ${phone}`;
  }
}

// 4. 生成密码
export function generatePassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  
  let password = '';
  
  if (Math.random() < 0.6) {
    password += uppercase.charAt(secureRandom(0, uppercase.length - 1));
  } else {
    password += lowercase.charAt(secureRandom(0, lowercase.length - 1));
  }
  
  const bodyLength = secureRandom(5, 7);
  for (let i = 0; i < bodyLength; i++) {
    password += lowercase.charAt(secureRandom(0, lowercase.length - 1));
  }
  
  const numLength = secureRandom(2, 3);
  if (Math.random() < 0.4) {
    const year = secureRandom(1980, 2005);
    password += Math.random() < 0.5 ? year.toString() : year.toString().slice(-2);
  } else {
    for (let i = 0; i < numLength; i++) {
      password += numbers.charAt(secureRandom(0, numbers.length - 1));
    }
  }
  
  if (Math.random() < 0.5) {
    password += special.charAt(secureRandom(0, special.length - 1));
  }
  
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

// ✨ 6. 获取所有可用域名
export function getAllDomains(): string[] {
  return ["yopmail.com","00two.shop","00two.site","00xtwo.site","0cd.cn","123456.yopmail.com","15963.fr.nf","1nom.org","1xp.fr","20thmarvelcomics.com","3pati.cfd","41674.yopmail.com","713705.xyz","883.wishy.fr","aaa.veysem.pro","aad.veysem.pro","aae.veysem.pro","aaf.veysem.pro","aai.veysem.pro","aak.veysem.pro","aal.veysem.pro","aam.veysem.pro","aan.veysem.pro","aao.veysem.pro","aap.veysem.pro","aaq.veysem.pro","aar.veysem.pro","aas.veysem.pro","aat.veysem.pro","aau.veysem.pro","aav.veysem.pro","aaw.veysem.pro","aax.veysem.pro","aay.veysem.pro","aaz.veysem.pro","abc.yopmail.com","ab.kwtest.io","abo-free.fr.nf","abree.shop","accloud.click","accsell.vip","aceseria.site","ac-malin.fr.nf","acovi.click","ac.sensi.cloudns.be","actarus.infos.st","adgloselche.esmtp.biz","adobe.digiwav.store","adresse.biz.st","adresse.infos.st","aekie.top","aerohost.fun","aevun.click","afw.fr.nf","aifeo.fun","aikeno.fun","ainfan.fun","airairb.com","airem.space","airpurifierlab.com","aisee.online","aitoolsbox.website","ajumi.online","akivi.click","akupulsa.com","a.kwtest.io","aledrioroots.youdontcare.com","ali.yopmail.com","alphax.fr.nf","altrans.fr.nf","alves.fr.nf","alyspace.cfd","alyxgod.rf.gd","alzem.xyz","anchrisbaton.acmetoy.com","anfel.online","angisadevelopment.yopmail.com","anoiz.site","anreb.fun","antispam.fr.nf","antispam.rf.gd","anvee.fun","anviu.fun","anzem.fun","aonoi.top","aorne.online","aoroi.click","aqualesb.cfd","arios.click","ariun.site","arkhearts.space","aryue.click","asren.site","assurmail.net","ass.veysem.pro","asyon.site","ateblanc.icu","autre.fr.nf","autumnlab.fun","avilive.live","azdea.xyz","azeco.fun","aze.kwtest.io","azemo.xyz","azeqsd.fr.nf","bahoo.biz.st","bajihouppalle.shop","balva.online","bapratique.shop","batuparadise.com","bboys.fr.nf","bdsmporno.org","beixa.top","belaplus.com.br","belfo.top","bexlom.click","bibi.biz.st","bibie.me","bicie.my.id","bifle.fr.nf","bin-ich.com","binich.com","bin.thomas-henon.fr","bitbox.my.id","bixmo.click","bizre.top","blavi.top","bleu.hopto.org","blip.ovh","bolzi.fun","bomau.top","bomoo.fun","bonmu.fun","boucheny.ovh","bounshnetwork.com","brafrannajufre.shop","brenz.asia","briendille.biz.id","brilo.fun","brinz.top","broubeiyitreboi2586.rest","buccha.icu","bunfan.top","businesstool.store","byn.laurada.fr","cabiste.fr.nf","cacze.online","caene.asia","calendro.fr.nf","calima.asso.st","camoo.online","caowe.top","capcud.my.id","capcud.web.id","caramail.d3vs.net","careb.top","carioca.biz.st","cariri.gorgonoid.online","carnesa.biz.st","carze.online","catja.online","cattoigressagri3248.shop","cavee.top","cayoe.fun","cayre.fun","c-cenfirman.com","cc.these.cc","c-dominicfrance.com","cedea.top","cedix.xyz","cegetel.fr.nf","celfe.fun","celov.fun","cench.top","cende.fun","cenvo.click","c-eric.fr.nf","certexx.fr.nf","cervu.top","cewz.online","ceyone.click","cezem.top","chamedoon.cfd","chatlabs.it","chemail.us","chhhi.xyz","chiwo.online","choso.baby","christopherma.net","ciemo.top","cinoe.click","ciovo.top","circlegame.iceiy.com","ckmz.site","clavq.cfd","cleanandold.com","clickmada.xyz","cli.cloudns.cl","cloud.gaobo.org","cloudsign.in","clutunpodli.ddns.info","cmail.fr.nf","cmkc.homes","cmkg.beauty","cndlr.fun","coaz.site","cobal.infos.st","coizy.tech","colaiah.click","colopi.xyz","comau.fun","conmu.top","conoi.online","contact.biz.st","contact.braverli.com","contact.infos.st","cookie007.fr.nf","copitojad.com","coroi.fun","cotom.click","courriel.fr.nf","courrier.589.ca","covom.cfd","cozyborough.com","cpc.cx","creze.asia","ctly.site","cubox.biz.st","cupreman.me","curef.cfd","cuxem.cfd","cydae.site","czennie.shop","dakoci.fun","dann.mywire.org","dao.pp.ua","daph.store","darty.biz.st","davru.top","dealgongmail.com","dealv.store","dede.infos.st","degap.fr.nf","deniq.shop","denoq.xyz","derok.top","desfrenes.fr.nf","dgse.infos.st","digitalmaster.fun","digiwav.store","digywav.store","dioscolwedddas.3-a.net","dis.hopto.org","dizmo.click","dlvr.us.to","dmts.fr.nf","doimi.click","doipoceiffefeu.shop","doktor-x.gq","dollcore.my.id","domvi.shop","donemail.my.id","donfo.fun","drafi.cfd","drako.cfd","dratvo.cfd","draxu.cfd","draxum.cfd","draxu.shop","dreamgreen.fr.nf","drilq.cfd","drilux.cfd","dripzgaming.com","dromiq.cfd","drovex.cfd","drqen.cfd","drunz.shop","druva.fun","druxel.cfd","druzik.pp.ua","dtpt.sg","dulfi.shop","dunro.xyz","dystluv.online","eads.cc","ealea.fr.nf","eczo.site","eivon.click","eizer.site","ekzei.top","elcoz.fun","elkout.com","elmail.4pu.com","elmen.click","elzem.click","email.1xp.fr","email.a51.fr","emaildark.fr.nf","emailspot.org","enfen.fun","enkio.fun","enpa.rf.gd","ensoe.click","eomze.click","eonei.uno","eooo.mooo.com","ernou.click","ervis.online","erzeo.site","esdev.fun","esiries.cloud","esmia.online","espun.click","etherxl.me","eucan.fun","evyn.fun","exmail.fun","extanewsmi.zzux.com","ezepi.fun","ezmen.info","ezore.online","ezoye.cfd","facturecolombia.info","fakemail.shop","fandee.fun","fanoi.top","fanzu.online","fapet.edu.pl","femdomfan.net","femdom-here.com","femqi.click","fenart.site","fensv.shop","fenval.online","fenve.fun","feqtra.online","fevon.top","fhpfhp.fr.nf","findz.my.id","fiorellahakie.yopmail.com","fj.fr","fjisfggroup.icu","flaimenet.ir","flalular.shop","fleurreines.com","flobo.fr.nf","florajuju.dedyn.io","floru.click","flyawaypigeon.net","foica.online","foktr.cfd","fomix.shop","fonbi.online","fonoi.fun","fpalehe.com","fr3e4ever.ddns.net","frakoyavopra.shop","frankpixel.store","frebix.click","free.exitnodes.uk","freemail.biz.st","freepromos.in","freepromos.info","frelk.shop","frezn.top","frint.top","fronq.click","frostmail.fr.nf","froza.click","fruzi.top","frylo.click","ftime.store","fulltv.win","funqer.online","fussionlabs.me","futke.shop","fylex.click","galaserv.fr","galaxim.fr.nf","galpe.shop","gandaiameiomart.online","gathelabuc.almostmy.com","gcaritos.top","gctech.top","gemanteres.shop","geniusstudio.tech","get.route64.de","get.vpn64.de","ggamess.42web.io","ggmail.biz.st","giantessa.net","gimuemoa.fr.nf","gladogmi.fr.nf","gland.xxl.st","globalinternet.fr.nf","gmaccess.space","gmaijoter.shop","gmail.yopmail.com","gmail.yopmail.fr","gmai.yopmail.com","gomra.top","gondemand.fr","gonse.online","good321.com","gous.live","govnoed.su","gralx.top","gratis-gratis.com","gratosmail.fr.nf","gravo.cfd","grazi.asia","grevi.top","guglemaul.shop","haben-wir.com","habenwir.com","hafabala.shop","halopere.shop","hanfe.top","havro.top","heavenofgaming.com","helsi.click","hen33.com","hgudovocroxoi8182.rest","hide.biz.st","himail.infos.st","hmmml.com","hotmail999.com","hotmaise.site","howbii.store","hrdfck.me","httpsblms.site","hunnur.com","hyperallergic.uk","iamfrank.rf.gd","icebi.click","idrizal.site","iicloud.com.vn","imails.asso.st","imap.fr.nf","imap.yopmail.com","imel.nextgenop.eu.org","inactiona.shop","inc.ovh","inenseti.shop","ingrok.win","internaut.us.to","iovee.fun","iryue.xyz","isep.fr.nf","ismarsofi.shop","isren.fun","ist-hier.com","istrisahnyafelix.my.id","ivome.fun","iya.fr.nf","izmun.click","jadeuvoikeloi9422.shop","janecart.click","janecart.shop","janeencalaway.com","javee.click","jazya.site","jeardamars.shop","jeime.fun","jeme.mastur.be","jeodumifi.ns3.name","jeone.online","jetable.fr.nf","jetable.org","jimael.com","jinva.fr.nf","jmail.fr.nf","jmas.site","jorginaldo.shop","jorzo.click","josubby.it","josubby.me","js11.top","jsmail.biz.st","jsmail.it","jude.yopmail.com","junex.fun","k4g.me","k7g.me","kalpi.shop","kathwld.store","katru.shop","kaxze.cfd","kazira.sbs","kazor.shop","kebab.my.id","keinth.xyz","kejy.top","kelmu.top","keluv.fun","kelva.cfd","kelvyo.site","kemulastalk.https443.org","kenbi.click","kenecrehand.port25.biz","keran.shop","kexvi.click","keysoftmail.store","kezlun.click","kiose.site","kiove.online","kiz.rip","klear.click","klenv.shop","knzora.com","kodekuh.xyz","koffe.tech","koica.top","kolfe.fun","komau.online","komoo.click","korun.shop","kosre.online","koswe.online","koutranosere9419.live","koyco.fun","krevo.top","kumachi.site","kuree.online","kyuusei.fr.nf","kzmta.xyz","lacraffe.fr.nf","lakoi.fun","larkwater.shop","laurenscmdt.asia","lazybird.site","le.monchu.fr","lerch.ovh","levanh.com","levanh.online","levanh.store","leysatuhell.sendsmtp.com","likeageek.fr.nf","likedog.sbs","lindaontheweb.com","linuxbp.free.nf","liprauppeittibra5377.shop","livie.cfd","livikyn.com","lonoi.click","lophe.top","lorvi.shop","loverlake.site","lovexor.me","lunqer.online","lunxen.com","lurniq.site","luvlyth.cfd","luvmaeve.info","luvmeyri.space","lyaws.tech","ma1l.duckdns.org","mabal.fr.nf","ma-boite-aux-lettres.infos.st","machen-wir.com","machica.online","madea.cfd","ma.ezua.com","mai.25u.com","mail.1secmail.my.id","mailadresi.tk","mail.berwie.com","mailbox.biz.st","mail.chaxiraxi.ch","mail.gigadu.de","mailhubpros.com","mail.i-dork.com","mail-imap.yopmail.com","mail.inforoca.ovh","mail.mailsnails.com","mail-mario.fr.nf","mailprohub.com","mailsafe.fr.nf","mailshopee.io.vn","mailsnails.com","mailsnd.shop","mail.tbr.fr.nf","mailtranhien.com","mailtranhien.online","mail.tranhongquan.dpdns.org","mail.xstyled.net","mail.yabes.ovh","mail.yopmail.com","mailz.com.br","malqin.online","managmaius.shop","manuted.co","marde.click","marksandspencer.com.vn","masdjan.space","matrippaddoiquoi.shop","maunilleufetrei7462.shop","mavren.online","mavri.fun","mavtoq.online","ma.zyns.com","mccarts.cfd","mcdomaine.fr.nf","mean.gq","mecix.fun","megamail.fr.nf","mekie.xyz","mekro.fun","melbo.top","melfe.online","menagoogle.shop","menqos.online","mercadine.shop","merfe.fun","mes-emails.fr.nf","mesemails.fr.nf","mess-mails.fr.nf","mexar.xyz","mexze.fun","meyri.site","mezor.top","mickaben.biz.st","mickaben.fr.nf","mickaben.xxl.st","miefo.online","miene.click","miistermail.fr","miloras.fr.nf","mimco.click","mimoo.fun","minqer.online","miore.fun","miowe.online","miozo.site","mivar.fun","mivlos.online","mivqu.shop","mivro.click","mixmo.click","mizka.online","mkmouse.top","mktchv.biz","mmmv.ru","mocix.shop","moenze.cfd","moice.click","mokze.xyz","molfe.online","moltu.shop","molviri.online","moncourriel.fr.nf","moncourrier.fr.nf","mondial.asso.st","monemail.fr.nf","monmail.fr.nf","monsieurbiz.wtf","monvik.online","mopri.fun","mormi.online","mornu.click","moroi.online","mortmesttesre.wikaba.com","motom.cfd","mottel.fr","mozzu.online","mr-email.fr.nf","mspotify.com","m.tartinemoi.com","mufex.click","multeq.online","munqa.xyz","murom.fun","musoe.fun","muzchuvstv.store","mviq.ru","mwuffyn.cfd","mxeru.xyz","mymailbox.xxl.st","mymaildo.kro.kr","mymail.infos.st","mynes.com","myrxxx.site","myself.fr.nf","mzemo.cfd","napo.web.id","naree.fun","naxze.click","nayaz.click","nedea.fun","nekie.fun","nelocrerunnu1403.shop","nerze.site","netom.fun","nevro.fun","nguwawor.web.id","nidokela.biz.st","niezy.click","nikora.biz.st","nikora.fr.nf","nirqa.click","nizon.top","nocan.top","noclue.space","nofan.fun","nofileid.com","noiva.click","nokie.click","nomau.click","nomes.fr.nf","nonmu.fun","nonzo.online","noreply.fr","nospam.fr.nf","noxem.click","noyp.fr.nf","nucan.top","nufex.shop","nusoe.xyz","ochie.online","ocmun.fun","ohayo.uno","oldamz.com","olididas.shop","olzem.cfd","omicron.token.ro","omruu.online","oos.cloudns.be","opuraio.work.gd","orthocrypt.org","oryue.top","osvun.top","ounex.click","ovrie.online","oyimail.store","pafix.xyz","pamil.fr.nf","panahan.papamana.com","papki.shop","parleasalwebp.zyns.com","pecnou.click","pelfe.click","pelisservispremium.com","penzi.click","pepisonline.top","pereb.click","personaliter.shop","phuctdv.top","pigeon.vavo.be","pilax.xyz","pinepo.top","pitiful.pp.ua","pitimail.xxl.st","pixeelstore.store","pixelgagnant.net","pixelzon.store","piznu.xyz","playersmails.com","pleasehide.me","plixup.com","pliz.fr.nf","plorn.top","plowkids.com.br","pluvi.top","pochtac.ru","pokemons1.fr.nf","polfe.click","polloiddetike2653.shop","pooo.ooguy.com","pop3.yopmail.com","popol.fr.nf","porncomics.top","porsilapongo.cl","posvabotma.x24hr.com","poubelle-du.net","poubelle.fr.nf","poumo.fun","poy.e-paws.net","pozes.click","premthings.shop","present-hit.store","prettyshan.cfd","prewx.com","prostopochta.com","prucilluyitre6156.shop","prulo.top","psn-wallet.com","pulfex.click","punisher-1.one","punuq.xyz","purnix.online","qadru.shop","qandru.cfd","qandz.cfd","qarvex.cfd","qavix.cfd","qavol.shop","qebrix.click","qeltri.online","qelvo.click","qelvu.top","qemrox.online","qemtu.click","qerla.fun","qerlu.top","qesnu.site","qevrox.click","qilra.click","qirvo.click","qolmi.click","qoltu.top","qornti.site","qorvim.cfd","qqb.veysem.pro","qqc.veysem.pro","qqe.veysem.pro","qqi.veysem.pro","qqm.veysem.pro","qqn.veysem.pro","qqo.veysem.pro","qqp.veysem.pro","qqq.veysem.pro","qqr.veysem.pro","qqt.veysem.pro","qqu.veysem.pro","qqv.veysem.pro","qqw.veysem.pro","qqx.veysem.pro","qqy.veysem.pro","qqz.veysem.pro","quden.xyz","quichebedext.freetcp.com","quinsy.cfd","qybru.click","qynex.click","qztri.click","rabopraussoppu2694.shop","raine.fun","raiseduki.me","randol.infos.st","rapidefr.fr.nf","rayibreuxenne.shop","rdsfs.icu","readmail.biz.st","redi.fr.nf","reiza.click","relvok.site","reox.fun","repula.gecigran.at","retep.com.au","retom.xyz","revom.xyz","revun.fun","rexvi.top","rexze.xyz","reyco.fun","reyon.site","riex.beauty","rilvex.site","rippoiteffocroi2229.shop","rivno.xyz","rizonchik.ru","roina.click","rongrongtu.cn","ronpy.site","routrebumuppi.shop","rovee.top","rozwe.online","rukal.shop","rvcosmic.site","rvone.click","rygel.infos.st","rzmun.xyz","s0.at","sabrestlouis.com","sacoi.shop","safrequoppevei.shop","safrol.site","sage.yopmail.com","sakaephong.us","samiu.shop","sanporeta.ddns.name","saove.top","saovta41.com","sareb.online","sarme.site","sasori.uno","sausetihenne.shop","scat-fantasy.com","scat-fantasy.net","scat-fetish.cc","scatporntube.cc","scattoilet.cc","scattube.cc","scina.fun","sdj.fr.nf","sdollv.lat","seanpogii-036392.yopmail.com","seena.online","sefan.click","selfe.fun","seloci.online","selqor.site","selrox.site","selro.xyz","sendos.fr.nf","sendos.infos.st","sen.se.dns-dynamic.net","senvel.online","seoye.fun","serbe.online","seriv.top","serveroutsource.net","sevun.online","sg.one.gb.net","sibro.cfd","sidn.ai","silvar.site","sind-hier.com","sindhier.com","sind-wir.com","sindwir.com","sing-me.store","siors.online","sirttest.us.to","sitex.fun","sivex.top","sivna.xyz","six25.biz","sixxsystem.store","skole.click","skunktest.work","skynet.infos.st","slowm.it","smartiuati.shop","smtp.yopmail.fr","snavo.cfd","socra.asia","soeca.fun","softpixel.store","softpix.store","soive.online","sokvim.site","solza.asia","somau.fun","somy.asia","sonoi.fun","soobin.cloud","sorcu.icu","soref.top","sorfia.com.br","soroi.top","soruz.click","sorvi.fun","souma.duckdns.org","sovom.click","sozes.online","spacibbacmo.lflink.com","spam.aleh.de","spam.kernel42.com","spam.lapoutre.net","spam.laymain.com","spam.quillet.eu","sponsstore.com","spotifans.club","spotifyreseller.biz","spotifyseller.co","srava.site","sreyi.online","srmun.shop","sruni.shop","sryue.cfd","ssi-bsn.infos.st","stavq.cfd","stelu.click","stoye.click","studioives.space","sucan.shop","sulov.fun","sumen.shop","super.lgbt","suppdiwaren.ddns.me.uk","surner.site","surni.click","suxem.top","szimo.click","szio.fun","tagara.infos.st","takayuki.cfd","takemewithu.me","takru.xyz","talver.online","tarvox.online","tavqir.click","tavqi.top","technologyis.online","techxs.dx.am","temp2.qwertz.me","tempmail.bearzi.it","tempmail.famee.it","temp.qwertz.me","teqol.xyz","terre.infos.st","test.actess.fr","tester2341.great-site.net","test.inclick.net","test-infos.fr.nf","tevro.click","tgmph.uno","tivo.camdvr.org","tivqa.xyz","tivro.xyz","tklsxxy.site","tmail.014.fr","tmp.qqu.be","tmp.raene.fr","tmp.world-of-ysera.com","tmp.x-lab.net","tonval.online","toolbox.ovh","toopitoo.com","torqem.click","torrent411.fr.nf","torvi.fun","totococo.fr.nf","tous-mes-mails.fr","tozes.top","tpaglucerne.dnset.com","tqerv.cfd","tqomi.xyz","tradingviewgiare.com","tragl.cfd","trakn.cfd","traodoinick.com","trelm.click","trevours.site","trevu.click","trevz.shop","trewo.cfd","trichic.com.br","trixieberry.shop","trmex.shop","trosmar.shop","trovin.click","trovi.top","troyaugoixudei.shop","trustenroll.com","tshirtsavvy.com","tulvi.shop","tuvqi.xyz","tweakacapun.wwwhost.biz","tweet.fr.nf","tyuublog.sbs","ucziak.cfd","ukey.ru","undergmail.net","upc.infos.st","urecloud.icu","uryue.fun","vakri.top","vamen.top","varaprasadh.dev","varzi.site","vaxlio.click","veiki.site","veilee.tk","velqon.site","velun.cfd","velvette.pro","vemiu.top","veolo.top","veoye.top","verifymail.iodomain883.wishy.fr","verom.top","ves.ink","vesoe.top","vetom.top","veusillodduse.shop","vexem.xyz","vexru.click","vexze.top","veysem.pro","vigilantkeep.net","vimun.top","vip.ep77.com","virek.click","vnkey.shop","voica.click","voine.top","vokva.xyz","vonen.fun","vonex.click","vonmu.online","voref.xyz","vorna.click","voroi.fun","voses.fun","votra.click","vouduvemmappau.shop","vovio.top","vrati.xyz","vraxu.cfd","vrens.click","vropin.click","vucan.xyz","vurni.top","vurnoq.site","vurns.shop","vuxra.xyz","vynoq.click","walopodes.shop","waltin.site","warix.shop","warlus.asso.st","waupaffugrobe9224.rest","wczo.online","webclub.infos.st","webstore.fr.nf","welrix.site","wermicorp.site","wexli.shop","wexni.fun","wexro.fun","whatagarbage.com","whattt.site","wirlex.site","wir-sind.com","wirten.site","wishy.fr","wixpor.site","wokniz.site","wolzed.site","womiu.click","womlez.site","wonfa.online","wonoi.asia","wonoi.fun","woofidog.fr.nf","woremi.site","woyen.fun","wozi.online","writershub.shop","wunqi.shop","wupqi.fun","wutri.fun","wwe.veysem.pro","wwp.veysem.pro","wwq.veysem.pro","wwr.veysem.pro","wwt.veysem.pro","www.veysem.pro","www.yopmail.com","wxcv.fr.nf","xalme.cfd","xapne.shop","xavru.xyz","xebro.fun","xedfocorp.site","xelpri.click","xelya.fun","xemlu.top","xeniahlly.xyz","xenpu.fun","xernq.shop","xevni.click","xevton.click","xevtu.top","xieno.click","xikemail.com","xilvor.click","ximra.top","xinco.site","xirvo.xyz","xmail.omnight.com","xonoi.click","xonpe.xyz","xoxoluv.site","xoxonics.shop","xrtex.top","xulpen.click","xurlo.xyz","xurme.xyz","xuvlen.click","xyeli.site","yahooz.xxl.st","yaloo.fr.nf","yasme.site","yawua.us","y.dldweb.info","yellow.org.in","yemrox.online","yemtra.online","yexma.online","yibore.icu","y.iotf.net","yitruq.online","y.lochou.fr","ymail.villien.net","ym.cypi.fr","ym.digi-value.fr","yocan.fun","yohmail.com","yolluyexabeu.shop","yolme.fun","yolmid.site","yoltu.top","yomiu.info","yop.codaspot.com","yop.emersion.fr","yop.fexp.io","yop.kyriog.fr","yop.mabox.eu","yopmail.fr","yopmail.kro.kr","yopmail.net","yopmail.ozm.fr","yop.mc-fly.be","yop.milter.int.eu.org","yop.moolee.net","yop.profmusique.com","yop.punkapoule.fr","yop.smeux.com","yop.too.li","yoptruc.fr.nf","yop.uuii.in","yop.work.gd","yop.xn--vqq79r59m.eu.org","yotmail.fr.nf","yotmir.online","yourmailtoday.com","ypmail.sehier.fr","yskganda.org","yubee.space","yurko.fun","yurpex.site","yuzecroicrofei2636.live","yvrak.xyz","ywzmb.top","zadrun.cfd","zamoo.top","zanqir.cfd","zarduz.cfd","zarte.shop","zavmi.click","zawen.click","zebee.fun","zedea.click","zeden.click","zee5.news","zeivoe.click","zekro.click","zelfe.fun","zelfe.top","zelmi.click","zemen.fun","zemix.click","zenbri.online","zenko.top","zer02.cfd","zeref.fun","zerev.fun","zesco.click","zevun.top","zexem.fun","zeyra.site","zheraxynxie.cfd","ziche.online","zidre.xyz","zihugahebre1749.shop","zikio.top","zilop.xyz","zimeq.click","zimok.shop","zinfighkildo.ftpserver.biz","zione.click","zipio.top","ziufan.online","zivran.site","zmac.site","zmah.store","zmku.biz.id","zocen.fun","zocer.site","zodru.shop","zoica.fun","zokie.cfd","zoldan.cfd","zolfe.top","zoliv.xyz","zolmi.click","zonde.asia","zonlu.click","zonmu.click","zoom163.cyou","zoore.xyz","zorg.fr.nf","zosoe.cfd","zouz.fr.nf","zovori.click","zovtem.online","zqeli.click","zqorn.click","zresa.online","zucan.click","zunet.xyz","zunra.top","zunvi.top","zurniu.site","zx81.ovh","zxcc.lol"];
  }

// ✨ 7. 生成邮箱 - 支持自选域名
export function generateEmail(firstName: string, lastName: string, customDomain?: string) {
  const cleanFirstName = convertToLatinChars(firstName);
  const cleanLastName = convertToLatinChars(lastName);
  
  // 如果提供了自定义域名,使用它;否则随机选择
  const domain = customDomain || getAllDomains()[secureRandom(0, getAllDomains().length - 1)];
  
  // ✅ 年龄范围:18-25 岁
  const currentYear = new Date().getFullYear();
  const age = secureRandom(18, 25);
  const birthYear = currentYear - age;
  const shortYear = birthYear.toString().slice(-2);
  
  const uniqueNum = secureRandom(1, 999);
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