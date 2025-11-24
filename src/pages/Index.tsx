import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ============ 数据配置 ============
const MOBILE_PREFIXES = [
  "134","135","136","137","138","139","147","150","151","152","157","158","159","178","182","183","184","187","188","198",
  "130","131","132","145","155","156","166","171","175","176","185","186",
  "133","149","153","173","177","180","181","189","191","199"
];

// 精简到常用的150个YOPmail后缀
const EMAIL_SUFFIXES = [
 "@yopmail.com","@00two.shop","@00two.site","@00xtwo.site","@0cd.cn","@123456.yopmail.com","@15963.fr.nf","@1nom.org","@1xp.fr","@20thmarvelcomics.com","@3pati.cfd","@41674.yopmail.com","@713705.xyz","@883.wishy.fr","@aaa.veysem.pro","@aad.veysem.pro","@aae.veysem.pro","@aaf.veysem.pro","@aai.veysem.pro","@aak.veysem.pro","@aal.veysem.pro","@aam.veysem.pro","@aan.veysem.pro","@aao.veysem.pro","@aap.veysem.pro","@aaq.veysem.pro","@aar.veysem.pro","@aas.veysem.pro","@aat.veysem.pro","@aau.veysem.pro","@aav.veysem.pro","@aaw.veysem.pro","@aax.veysem.pro","@aay.veysem.pro","@aaz.veysem.pro","@abc.yopmail.com","@ab.kwtest.io","@abo-free.fr.nf","@abree.shop","@accloud.click","@accsell.vip","@ac-malin.fr.nf","@acovi.click","@ac.sensi.cloudns.be","@actarus.infos.st","@adgloselche.esmtp.biz","@adobe.digiwav.store","@adresse.biz.st","@adresse.infos.st","@aekie.top","@aerohost.fun","@aevun.click","@afw.fr.nf","@aifeo.fun","@aikeno.fun","@ainfan.fun","@airairb.com","@airem.space","@airpurifierlab.com","@aisee.online","@aitoolsbox.website","@ajumi.online","@akivi.click","@akupulsa.com","@a.kwtest.io","@aledrioroots.youdontcare.com","@ali.yopmail.com","@alphax.fr.nf","@altrans.fr.nf","@alves.fr.nf","@alyspace.cfd","@alyxgod.rf.gd","@alzem.xyz","@anchrisbaton.acmetoy.com","@anfel.online","@angisadevelopment.yopmail.com","@anoiz.site","@anreb.fun","@antispam.fr.nf","@antispam.rf.gd","@anvee.fun","@anviu.fun","@anzem.fun","@aonoi.top","@aorne.online","@aoroi.click","@aqualesb.cfd","@arios.click","@ariun.site","@arkhearts.space","@aryue.click","@asren.site","@assurmail.net","@ass.veysem.pro","@asyon.site","@ateblanc.icu","@autre.fr.nf","@autumnlab.fun","@avilive.live","@azab.duckdns.org","@azdea.xyz","@azeco.fun","@aze.kwtest.io","@azemo.xyz","@azeqsd.fr.nf","@bahoo.biz.st","@bajihouppalle.shop","@balva.online","@bapratique.shop","@batuparadise.com","@bboys.fr.nf","@bdsmporno.org","@beixa.top","@belaplus.com.br","@belfo.top","@bibi.biz.st","@bibie.me","@bifle.fr.nf","@bin-ich.com","@binich.com","@bin.thomas-henon.fr","@bitbox.my.id","@bixmo.click","@bizre.top","@blavi.top","@bleu.hopto.org","@blip.ovh","@bolzi.fun","@bomau.top","@bomoo.fun","@bonmu.fun","@boucheny.ovh","@bounshnetwork.com","@brafrannajufre.shop","@brenz.asia","@briendille.biz.id","@brilo.fun","@brinz.top","@broubeiyitreboi2586.rest","@bunfan.top","@byn.laurada.fr","@cabiste.fr.nf","@cacze.online","@caene.asia","@calendro.fr.nf","@calima.asso.st","@camoo.online","@caowe.top","@capcud.my.id","@capcud.web.id","@caramail.d3vs.net","@careb.top","@carioca.biz.st","@cariri.gorgonoid.online","@carnesa.biz.st","@carze.online","@catja.online","@cattoigressagri3248.shop","@cavee.top","@cayoe.fun","@cayre.fun","@cc.these.cc","@cedea.top","@cedix.xyz","@cegetel.fr.nf","@celfe.fun","@celov.fun","@cench.top","@cende.fun","@cenvo.click","@c-eric.fr.nf","@certexx.fr.nf","@cervu.top","@cewz.online","@ceyone.click","@cezem.top","@chamedoon.cfd","@chatlabs.it","@chemail.us","@chhhi.xyz","@chiwo.online","@choso.baby","@christopherma.net","@ciemo.top","@cinoe.click","@ciovo.top","@circlegame.iceiy.com","@ckmz.site","@clavq.cfd","@cleanandold.com","@clickmada.xyz","@cli.cloudns.cl","@cloud.gaobo.org","@cloudsign.in","@clutunpodli.ddns.info","@cmail.fr.nf","@cmkc.homes","@cmkg.beauty","@cndlr.fun","@coaz.site","@cobal.infos.st","@coizy.tech","@colaiah.click","@colopi.xyz","@comau.fun","@conmu.top","@conoi.online","@contact.biz.st","@contact.braverli.com","@contact.infos.st","@cookie007.fr.nf","@copitojad.com","@coroi.fun","@cotom.click","@courriel.fr.nf","@courrier.589.ca","@covom.cfd","@cozyborough.com","@cpc.cx","@creze.asia","@ctly.site","@cubox.biz.st","@curef.cfd","@cuxem.cfd","@cydae.site","@czennie.shop","@dakoci.fun","@dann.mywire.org","@dao.pp.ua","@daph.store","@darty.biz.st","@davru.top","@dealgongmail.com","@dealv.store","@dede.infos.st","@degap.fr.nf","@deniq.shop","@denoq.xyz","@derok.top","@desfrenes.fr.nf","@dgse.infos.st","@digitalmaster.fun","@digiwav.store","@digywav.store","@dioscolwedddas.3-a.net","@dis.hopto.org","@dizmo.click","@dlvr.us.to","@dmts.fr.nf","@doimi.click","@doipoceiffefeu.shop","@doktor-x.gq","@domvi.shop","@donemail.my.id","@donfo.fun","@drafi.cfd","@drako.cfd","@dratvo.cfd","@draxum.cfd","@draxu.shop","@dreamgreen.fr.nf","@drilq.cfd","@dripzgaming.com","@dromiq.cfd","@drovex.cfd","@drqen.cfd","@drunz.shop","@druva.fun","@druxel.cfd","@druzik.pp.ua","@dtpt.sg","@dulfi.shop","@dunro.xyz","@dystluv.online","@eads.cc","@ealea.fr.nf","@eczo.site","@eivon.click","@eizer.site","@ekzei.top","@elcoz.fun","@elkout.com","@elmail.4pu.com","@elmen.click","@elzem.click","@email.1xp.fr","@email.a51.fr","@emaildark.fr.nf","@emailspot.org","@enfen.fun","@enkio.fun","@enpa.rf.gd","@ensoe.click","@eomze.click","@eonei.uno","@eooo.mooo.com","@ernou.click","@ervis.online","@erzeo.site","@esdev.fun","@esiries.cloud","@esmia.online","@espun.click","@etherxl.me","@eucan.fun","@evyn.fun","@exmail.fun","@extanewsmi.zzux.com","@ezepi.fun","@ezmen.info","@ezore.online","@ezoye.cfd","@facturecolombia.info","@fakemail.shop","@fandee.fun","@fanoi.top","@fanzu.online","@fapet.edu.pl","@femdomfan.net","@femdom-here.com","@fenart.site","@fensv.shop","@fenval.online","@fenve.fun","@feqtra.online","@fevon.top","@fhpfhp.fr.nf","@findz.my.id","@fiorellahakie.yopmail.com","@fj.fr","@fjisfggroup.icu","@flaimenet.ir","@flalular.shop","@fleurreines.com","@flobo.fr.nf","@florajuju.dedyn.io","@floru.click","@flyawaypigeon.net","@foica.online","@foktr.cfd","@fomix.shop","@fonbi.online","@fonoi.fun","@fortune-gr.com","@fr3e4ever.ddns.net","@frakoyavopra.shop","@frankpixel.store","@frebix.click","@free.exitnodes.uk","@freemail.biz.st","@freepromos.in","@freepromos.info","@frelk.shop","@frezn.top","@frint.top","@fronq.click","@frostmail.fr.nf","@froza.click","@fruzi.top","@frylo.click","@ftime.store","@fulltv.win","@fussionlabs.me","@futke.shop","@fylex.click","@galaserv.fr","@galaxim.fr.nf","@galpe.shop","@gandaiameiomart.online","@gathelabuc.almostmy.com","@gcaritos.top","@gctech.top","@gemanteres.shop","@geniusstudio.tech","@get.route64.de","@get.vpn64.de","@ggamess.42web.io","@ggmail.biz.st","@giantessa.net","@gimuemoa.fr.nf","@gladogmi.fr.nf","@gland.xxl.st","@globalinternet.fr.nf","@gmaccess.space","@gmaijoter.shop","@gmail.yopmail.com","@gmail.yopmail.fr","@gmai.yopmail.com","@gomra.top","@gonse.online","@good321.com","@gous.live","@govnoed.su","@gralx.top","@gratis-gratis.com","@gratosmail.fr.nf","@gravo.cfd","@grazi.asia","@grevi.top","@guglemaul.shop","@haben-wir.com","@habenwir.com","@hafabala.shop","@halopere.shop","@hanfe.top","@havieee.store","@havro.top","@heavenofgaming.com","@helsi.click","@hgudovocroxoi8182.rest","@hide.biz.st","@himail.infos.st","@hmmml.com","@hotmail999.com","@hotmaise.site","@howbii.store","@hrdfck.me","@httpsblms.site","@hunnur.com","@hyperallergic.uk","@iamfrank.rf.gd","@icebi.click","@icidroit.info","@idrizal.site","@iicloud.com.vn","@imails.asso.st","@imap.fr.nf","@imap.yopmail.com","@imel.nextgenop.eu.org","@inactiona.shop","@inc.ovh","@inenseti.shop","@ingrok.win","@internaut.us.to","@iovee.fun","@iryue.xyz","@isep.fr.nf","@ismarsofi.shop","@isren.fun","@ist-hier.com","@istrisahnyafelix.my.id","@ivome.fun","@iya.fr.nf","@izmun.click","@jadeuvoikeloi9422.shop","@janecart.click","@janecart.shop","@janeencalaway.com","@javee.click","@jazya.site","@jeardamars.shop","@jeime.fun","@jeme.mastur.be","@jeodumifi.ns3.name","@jeone.online","@jetable.fr.nf","@jetable.org","@jimael.com","@jinva.fr.nf","@jmail.fr.nf","@jmas.site","@jorginaldo.shop","@jorzo.click","@josubby.it","@josubby.me","@jota7shop.com.br","@js11.top","@jsmail.biz.st","@jsmail.it","@jude.yopmail.com","@junex.fun","@k4g.me","@k7g.me","@kalpi.shop","@kathwld.store","@katru.shop","@kaxze.cfd","@kazira.sbs","@kazor.shop","@kebab.my.id","@keinth.xyz","@kejy.top","@kelmu.top","@keluv.fun","@kelva.cfd","@kelvyo.site","@kemulastalk.https443.org","@kenbi.click","@kenecrehand.port25.biz","@keran.shop","@kexvi.click","@keysoftmail.store","@kiose.site","@kiove.online","@kiz.rip","@klear.click","@klenv.shop","@knzora.com","@kodekuh.xyz","@koffe.tech","@koica.top","@kolfe.fun","@komau.online","@komoo.click","@korun.shop","@kosre.online","@koswe.online","@koutranosere9419.live","@koyco.fun","@krevo.top","@kumachi.site","@kuree.online","@kyuusei.fr.nf","@kzmta.xyz","@lacraffe.fr.nf","@lakoi.fun","@larkwater.shop","@laurenscmdt.asia","@lazybird.site","@le.monchu.fr","@lerch.ovh","@levanh.com","@levanh.online","@levanh.store","@leysatuhell.sendsmtp.com","@likeageek.fr.nf","@likedog.sbs","@lindaontheweb.com","@linuxbp.free.nf","@liprauppeittibra5377.shop","@livie.cfd","@livikyn.com","@lonoi.click","@lophe.top","@lorvi.shop","@louve.cfd","@loverlake.site","@lovexor.me","@lunqer.online","@lunxen.com","@luvae.uno","@luvmaeve.info","@luvmeyri.space","@luxiosnitro.com","@lyaws.tech","@ma1l.duckdns.org","@mabal.fr.nf","@ma-boite-aux-lettres.infos.st","@machen-wir.com","@machica.online","@madea.cfd","@ma.ezua.com","@mai.25u.com","@mail10s.top","@mail.1secmail.my.id","@mailadresi.tk","@mail.berwie.com","@mailbox.biz.st","@mail.chaxiraxi.ch","@mail.gigadu.de","@mailhubpros.com","@mail.i-dork.com","@mail-imap.yopmail.com","@mail.inforoca.ovh","@mail.mailsnails.com","@mail-mario.fr.nf","@mailprohub.com","@mailsafe.fr.nf","@mailshopee.io.vn","@mailsnails.com","@mailsnd.shop","@mail.tbr.fr.nf","@mailtranhien.com","@mailtranhien.online","@mail.xstyled.net","@mail.yabes.ovh","@mail.yopmail.com","@mailz.com.br","@malqin.online","@managmaius.shop","@manuted.co","@marde.click","@marksandspencer.com.vn","@masdjan.space","@matrippaddoiquoi.shop","@maunilleufetrei7462.shop","@mavri.fun","@mavtoq.online","@ma.zyns.com","@mccarts.cfd","@mcdomaine.fr.nf","@mean.gq","@mecix.fun","@megamail.fr.nf","@mekie.xyz","@mekro.fun","@melbo.top","@melfe.online","@menagoogle.shop","@mercadine.shop","@merfe.fun","@mes-emails.fr.nf","@mesemails.fr.nf","@mess-mails.fr.nf","@mexar.xyz","@mexze.fun","@meyri.site","@mezor.top","@mickaben.biz.st","@mickaben.fr.nf","@mickaben.xxl.st","@miefo.online","@miene.click","@miistermail.fr","@miloras.fr.nf","@mimco.click","@mimoo.fun","@minqer.online","@miore.fun","@miowe.online","@miozo.site","@mivar.fun","@mivlos.online","@mivqu.shop","@mivro.click","@mixmo.click","@mizka.online","@mkmouse.top","@mktchv.biz","@mmmv.ru","@mocix.shop","@moenze.cfd","@moice.click","@mokze.xyz","@molfe.online","@moltu.shop","@molviri.online","@moncourriel.fr.nf","@moncourrier.fr.nf","@mondial.asso.st","@monemail.fr.nf","@monmail.fr.nf","@monsieurbiz.wtf","@mopri.fun","@mormi.online","@mornu.click","@moroi.online","@mortmesttesre.wikaba.com","@motom.cfd","@mottel.fr","@mozzu.online","@mr-email.fr.nf","@mspotify.com","@m.tartinemoi.com","@mufex.click","@multeq.online","@munqa.xyz","@murom.fun","@musoe.fun","@muzchuvstv.store","@mviq.ru","@mwuffyn.cfd","@mxeru.xyz","@mymailbox.xxl.st","@mymaildo.kro.kr","@mymail.infos.st","@mynes.com","@myrxxx.site","@myself.fr.nf","@mzemo.cfd","@napo.web.id","@naree.fun","@naxze.click","@nayaz.click","@nedea.fun","@nekie.fun","@nelocrerunnu1403.shop","@nerze.site","@netom.fun","@nevro.fun","@nguwawor.web.id","@nidokela.biz.st","@niezy.click","@nikora.biz.st","@nikora.fr.nf","@nirqa.click","@nizon.top","@nocan.top","@noclue.space","@nofan.fun","@nofileid.com","@noiva.click","@nokie.click","@nomau.click","@nomes.fr.nf","@nonmu.fun","@nonzo.online","@noreply.fr","@nospam.fr.nf","@noxem.click","@noyp.fr.nf","@nucan.top","@nufex.shop","@nusoe.xyz","@ochie.online","@ocmun.fun","@ohayo.uno","@oldamz.com","@olididas.shop","@olzem.cfd","@omicron.token.ro","@omruu.online","@oos.cloudns.be","@opuraio.work.gd","@oryue.top","@osvun.top","@ounex.click","@ovrie.online","@oyimail.store","@pafix.xyz","@pamil.fr.nf","@panahan.papamana.com","@papki.shop","@parleasalwebp.zyns.com","@pecnou.click","@pelfe.click","@pelisservispremium.com","@penzi.click","@pepisonline.top","@pereb.click","@personaliter.shop","@phuctdv.top","@pigeon.vavo.be","@pilax.xyz","@pinepo.top","@pitiful.pp.ua","@pitimail.xxl.st","@pixeelstore.store","@pixelgagnant.net","@pixelzon.store","@piznu.xyz","@playersmails.com","@pleasehide.me","@plixup.com","@pliz.fr.nf","@plorn.top","@plowkids.com.br","@pluvi.top","@pochtac.ru","@pokemons1.fr.nf","@polfe.click","@polloiddetike2653.shop","@pooo.ooguy.com","@pop3.yopmail.com","@popol.fr.nf","@porncomics.top","@porsilapongo.cl","@posvabotma.x24hr.com","@poubelle-du.net","@poubelle.fr.nf","@poumo.fun","@poy.e-paws.net","@pozes.click","@premthings.shop","@present-hit.store","@prettyshan.cfd","@prewx.com","@prostopochta.com","@prucilluyitre6156.shop","@prulo.top","@psn-wallet.com","@pulfex.click","@punisher-1.one","@punuq.xyz","@purnix.online","@qadru.shop","@qandru.cfd","@qandz.cfd","@qarvex.cfd","@qavix.cfd","@qavol.shop","@qebrix.click","@qeltri.online","@qelvo.click","@qelvu.top","@qemtu.click","@qerla.fun","@qerlu.top","@qesnu.site","@qilra.click","@qirvo.click","@qolmi.click","@qoltu.top","@qornti.site","@qqb.veysem.pro","@qqc.veysem.pro","@qqe.veysem.pro","@qqi.veysem.pro","@qqm.veysem.pro","@qqn.veysem.pro","@qqo.veysem.pro","@qqp.veysem.pro","@qqq.veysem.pro","@qqr.veysem.pro","@qqt.veysem.pro","@qqu.veysem.pro","@qqv.veysem.pro","@qqw.veysem.pro","@qqx.veysem.pro","@qqy.veysem.pro","@qqz.veysem.pro","@quden.xyz","@quichebedext.freetcp.com","@quinsy.cfd","@qybru.click","@qynex.click","@qztri.click","@rabopraussoppu2694.shop","@raiseduki.me","@randol.infos.st","@rapidefr.fr.nf","@rayibreuxenne.shop","@rdsfs.icu","@readmail.biz.st","@redi.fr.nf","@reiza.click","@reox.fun","@repula.gecigran.at","@retep.com.au","@retom.xyz","@revom.xyz","@revun.fun","@rexvi.top","@rexze.xyz","@reyco.fun","@reyon.site","@riex.beauty","@rilvex.site","@rippoiteffocroi2229.shop","@rivno.xyz","@rizonchik.ru","@roina.click","@rongrongtu.cn","@ronpy.site","@routrebumuppi.shop","@rovee.top","@rozwe.online","@rukal.shop","@rvcosmic.site","@rvone.click","@rygel.infos.st","@rzmun.xyz","@s0.at","@sabrestlouis.com","@sacoi.shop","@safrequoppevei.shop","@safrol.site","@sage.yopmail.com","@sakaephong.us","@samiu.shop","@sanporeta.ddns.name","@saove.top","@saovta41.com","@sareb.online","@sarme.site","@sasori.uno","@sausetihenne.shop","@scat-fantasy.com","@scat-fantasy.net","@scat-fetish.cc","@scatporntube.cc","@scattoilet.cc","@scattube.cc","@scina.fun","@sdj.fr.nf","@sdollv.lat","@seanpogii-036392.yopmail.com","@seena.online","@sefan.click","@selfe.fun","@seloci.online","@selro.xyz","@sendos.fr.nf","@sendos.infos.st","@sen.se.dns-dynamic.net","@senvel.online","@seoye.fun","@serbe.online","@seriv.top","@serveroutsource.net","@sevun.online","@sibro.cfd","@sidn.ai","@sind-hier.com","@sindhier.com","@sind-wir.com","@sindwir.com","@sing-me.store","@siors.online","@sirttest.us.to","@sitex.fun","@sivex.top","@sivna.xyz","@six25.biz","@sixxsystem.store","@skole.click","@skunktest.work","@skynet.infos.st","@slowm.it","@smartiuati.shop","@smtp.yopmail.fr","@snavo.cfd","@socra.asia","@soeca.fun","@softpixel.store","@softpix.store","@soive.online","@sokvim.site","@solza.asia","@somau.fun","@somy.asia","@sonoi.fun","@sorcu.icu","@soref.top","@sorfia.com.br","@soroi.top","@soruz.click","@sorvi.fun","@souma.duckdns.org","@sovom.click","@sozes.online","@spacibbacmo.lflink.com","@spam.aleh.de","@spam.kernel42.com","@spam.lapoutre.net","@spam.laymain.com","@spam.quillet.eu","@sponsstore.com","@spotifans.club","@spotifyreseller.biz","@spotifyseller.co","@srava.site","@sreyi.online","@srmun.shop","@sruni.shop","@sryue.cfd","@ssi-bsn.infos.st","@stavq.cfd","@stelu.click","@stowbori.uno","@stoye.click","@studioives.space","@sucan.shop","@sulov.fun","@sumen.shop","@super.lgbt","@suppdiwaren.ddns.me.uk","@surner.site","@surni.click","@suxem.top","@szimo.click","@szio.fun","@tagara.infos.st","@takayuki.cfd","@takemewithu.me","@takru.xyz","@talver.online","@tavqir.click","@tavqi.top","@technologyis.online","@techsensew.tech","@temp2.qwertz.me","@tempmail.bearzi.it","@tempmail.famee.it","@temp.qwertz.me","@teqol.xyz","@terre.infos.st","@test.actess.fr","@tester2341.great-site.net","@test.inclick.net","@test-infos.fr.nf","@tevro.click","@tgmph.uno","@tivo.camdvr.org","@tivqa.xyz","@tivro.xyz","@tklsxxy.site","@tmail.014.fr","@tmp.qqu.be","@tmp.raene.fr","@tmp.world-of-ysera.com","@tmp.x-lab.net","@tonval.online","@toolbox.ovh","@toopitoo.com","@torrent411.fr.nf","@torvi.fun","@totococo.fr.nf","@tous-mes-mails.fr","@tozes.top","@tpaglucerne.dnset.com","@tqerv.cfd","@tqomi.xyz","@tradingviewgiare.com","@tragl.cfd","@trakn.cfd","@traodoinick.com","@trelm.click","@trevours.site","@trevu.click","@trevz.shop","@trewo.cfd","@trichic.com.br","@trixieberry.shop","@trmex.shop","@trosmar.shop","@trovin.click","@trovi.top","@troyaugoixudei.shop","@trustenroll.com","@tshirtsavvy.com","@tulvi.shop","@tuvqi.xyz","@tweakacapun.wwwhost.biz","@tweet.fr.nf","@tyuublog.sbs","@ucziak.cfd","@ukey.ru","@undergmail.net","@upc.infos.st","@urecloud.icu","@uryue.fun","@vakri.top","@vamen.top","@varaprasadh.dev","@varzi.site","@vaxlio.click","@veiki.site","@veilee.tk","@velqon.site","@velun.cfd","@velvette.pro","@vemiu.top","@veolo.top","@veoye.top","@verifymail.iodomain883.wishy.fr","@verom.top","@ves.ink","@vesoe.top","@vetom.top","@veusillodduse.shop","@vexem.xyz","@vexru.click","@vexze.top","@veysem.pro","@vigilantkeep.net","@vimun.top","@vip.ep77.com","@virek.click","@vnkey.shop","@voica.click","@voine.top","@vokva.xyz","@vonen.fun","@vonex.click","@vonmu.online","@voref.xyz","@vorna.click","@voroi.fun","@voses.fun","@votra.click","@vouduvemmappau.shop","@vovio.top","@vrati.xyz","@vraxu.cfd","@vrens.click","@vropin.click","@vucan.xyz","@vurni.top","@vurnoq.site","@vurns.shop","@vuxra.xyz","@vynoq.click","@walopodes.shop","@warix.shop","@warlus.asso.st","@waupaffugrobe9224.rest","@wczo.online","@webclub.infos.st","@webstore.fr.nf","@wermicorp.site","@wexli.shop","@wexni.fun","@wexro.fun","@whatagarbage.com","@whattt.site","@wirlex.site","@wir-sind.com","@wishy.fr","@wixpor.site","@wokniz.site","@womiu.click","@womlez.site","@wonfa.online","@wonoi.asia","@wonoi.fun","@woofidog.fr.nf","@woremi.site","@woyen.fun","@wozi.online","@writershub.shop","@wunqi.shop","@wupqi.fun","@wutri.fun","@wwe.veysem.pro","@wwp.veysem.pro","@wwq.veysem.pro","@wwr.veysem.pro","@wwt.veysem.pro","@www.veysem.pro","@www.yopmail.com","@wxcv.fr.nf","@xalme.cfd","@xapne.shop","@xavru.xyz","@xebro.fun","@xedfocorp.site","@xelpri.click","@xelya.fun","@xemlu.top","@xeniahlly.xyz","@xenpu.fun","@xernq.shop","@xevni.click","@xevton.click","@xevtu.top","@xieno.click","@xikemail.com","@xilvor.click","@ximra.top","@xirvo.xyz","@xmail.omnight.com","@xonoi.click","@xonpe.xyz","@xoxoluv.site","@xoxonics.shop","@xrtex.top","@xulpen.click","@xurlo.xyz","@xurme.xyz","@xyeli.site","@yahooz.xxl.st","@yaloo.fr.nf","@yasme.site","@yawua.us","@y.dldweb.info","@yellow.org.in","@yemtra.online","@yibore.icu","@y.iotf.net","@yitruq.online","@y.lochou.fr","@ymail.villien.net","@ym.cypi.fr","@ym.digi-value.fr","@yocan.fun","@yohmail.com","@yolluyexabeu.shop","@yolme.fun","@yolmid.site","@yoltu.top","@yomiu.info","@yop.codaspot.com","@yop.emersion.fr","@yop.fexp.io","@yop.kyriog.fr","@yop.mabox.eu","@yopmail.fr","@yopmail.kro.kr","@yopmail.net","@yopmail.ozm.fr","@yop.mc-fly.be","@yop.milter.int.eu.org","@yop.moolee.net","@yop.profmusique.com","@yop.punkapoule.fr","@yop.smeux.com","@yop.too.li","@yoptruc.fr.nf","@yop.uuii.in","@yop.work.gd","@yop.xn--vqq79r59m.eu.org","@yotmail.fr.nf","@yourmailtoday.com","@ypmail.sehier.fr","@yskganda.org","@yubee.space","@yurko.fun","@yurpex.site","@yuzecroicrofei2636.live","@yvrak.xyz","@ywzmb.top","@zadrun.cfd","@zamoo.top","@zanqir.cfd","@zarte.shop","@zavmi.click","@zawen.click","@zebee.fun","@zedea.click","@zeden.click","@zee5.news","@zeivoe.click","@zekro.click","@zelfe.fun","@zelfe.top","@zelmi.click","@zemen.fun","@zemix.click","@zenbri.online","@zenko.top","@zer02.cfd","@zeref.fun","@zerev.fun","@zesco.click","@zevun.top","@zexem.fun","@zeyra.site","@zheraxynxie.cfd","@ziche.online","@zidre.xyz","@zihugahebre1749.shop","@zikio.top","@zilop.xyz","@zimeq.click","@zimok.shop","@zinfighkildo.ftpserver.biz","@zione.click","@zipio.top","@ziufan.online","@zmac.site","@zmah.store","@zmku.biz.id","@zocen.fun","@zocer.site","@zodru.shop","@zoica.fun","@zokie.cfd","@zoldan.cfd","@zolfe.top","@zoliv.xyz","@zolmi.click","@zonde.asia","@zonlu.click","@zonmu.click","@zoore.xyz","@zorg.fr.nf","@zosoe.cfd","@zouz.fr.nf","@zovori.click","@zovtem.online","@zqeli.click","@zqorn.click","@zresa.online","@zucan.click","@zunet.xyz","@zunra.top","@zunvi.top","@zx81.ovh","@zxcc.lol"
];

const NAME_FRAGMENTS = [
  "john","mike","alex","david","chris","james","robert","michael","william","daniel",
  "matthew","joseph","thomas","charles","mark","paul","steven","brian","kevin","jason",
  "jeff","ryan","eric","smith","brown","jones","wilson","taylor","davis","miller",
  "moore","anderson","jackson","white","harris","martin","thompson","garcia","lee",
  "walker","hall","allen","young","king","wright","lopez","sam","tom","ben","joe","max"
];

// ============ 工具函数 ============
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const padZero = (num: number, length: number = 2) => num.toString().padStart(length, "0");

const generateName = (startWithVowel: boolean): string => {
  const vowels = "aeiou", consonants = "bcdfghjklmnpqrstvwxyz";
  let name = "";
  for (let i = 0; i < 15; i++) {
    const useVowel = startWithVowel ? i % 2 === 0 : i % 2 !== 0;
    const char = randomChoice([...(useVowel ? vowels : consonants)]);
    name += i === 0 ? char.toUpperCase() : char;
  }
  return name;
};

const generateEmailUsername = (): string => {
  const fragmentCount = randomInt(2, 3);
  let username = Array.from({ length: fragmentCount }, () => randomChoice(NAME_FRAGMENTS)).join("");
  
  while (username.length < 20) {
    username += Math.random() > 0.5 && (20 - username.length) >= 3
      ? padZero(randomInt(0, 999), 3)
      : randomChoice([..."abcdefghijklmnopqrstuvwxyz"]);
  }
  return username.substring(0, 20).toLowerCase();
};

const generateEmail = () => {
  const username = generateEmailUsername();
  return { email: username + randomChoice(EMAIL_SUFFIXES), emailUsername: username };
};

const generatePhoneNumber = () => "86" + randomChoice(MOBILE_PREFIXES) + padZero(randomInt(0, 99999999), 8);

const generateBirthday = () => {
  const age = randomInt(18, 25);
  const birthYear = new Date().getFullYear() - age;
  return `${birthYear}年${padZero(randomInt(1, 12))}月${padZero(randomInt(1, 28))}日`;
};

// ============ 类型定义 ============
interface UserInfo {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  emailUsername: string;
  birthday: string;
}

// ============ 子组件 ============
const InfoField = memo(({ 
  label, 
  value, 
  onCopy, 
  onRefresh, 
  isLink, 
  linkHref, 
  copying 
}: {
  label: string;
  value: string;
  onCopy: () => void;
  onRefresh?: () => void;
  isLink?: boolean;
  linkHref?: string;
  copying: boolean;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="flex gap-2">
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={copying}
            className="h-8 w-8 p-0 active:scale-90 transition-transform disabled:opacity-50"
            title="重新生成"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          disabled={copying}
          className="h-8 w-8 p-0 active:scale-90 transition-transform disabled:opacity-50"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
    {isLink && linkHref ? (
      <a
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base sm:text-lg font-medium text-blue-600 hover:text-blue-800 underline break-all inline-block"
      >
        {value}
      </a>
    ) : (
      <p className="text-base sm:text-lg font-medium break-all">{value}</p>
    )}
  </div>
));

const TelegramCard = memo(({ onCopy, copying }: { onCopy: () => void; copying: boolean }) => (
  <Card className="p-4 sm:p-5 rounded-2xl shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center">
        <svg className="w-7 h-7 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm sm:text-base mb-1">🎯 神秘代码@fang180</p>
        <p className="text-blue-100 text-xs leading-relaxed">创号教程、工具更新和独家资源</p>
      </div>
    </div>
    <Button 
      onClick={onCopy}
      disabled={copying}
      className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-50"
      size="lg"
    >
      复制神秘代码
    </Button>
  </Card>
));

// ============ 主组件 ============
const Index = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [copying, setCopying] = useState(false);
  const { toast } = useToast();

  const showToast = useCallback((title: string, description: string, duration = 1500) => {
    toast({ title, description, duration });
  }, [toast]);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(text);
      showToast("复制成功", `已复制${label}到剪贴板`);
    } catch {
      showToast("复制失败", "请手动复制内容", 2000);
    } finally {
      setTimeout(() => setCopying(false), 300);
    }
  }, [copying, showToast]);

  const handleGenerate = useCallback(() => {
    const emailData = generateEmail();
    setUserInfo({
      lastName: generateName(false),
      firstName: generateName(true),
      phone: generatePhoneNumber(),
      email: emailData.email,
      emailUsername: emailData.emailUsername,
      birthday: generateBirthday(),
    });
    showToast("生成成功", "已为您生成新的账号信息");
  }, [showToast]);

  const regenerateEmail = useCallback(() => {
    if (!userInfo) return;
    const emailData = generateEmail();
    setUserInfo(prev => prev ? { ...prev, ...emailData } : null);
    showToast("邮箱已更新", "已为您重新生成邮箱地址");
  }, [userInfo, showToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* 主标题 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">脸书创号小助手</h1>
            <span className="text-sm font-semibold text-white bg-blue-600 px-2 py-1 rounded-full">v2.0</span>
          </div>
        </div>

        {/* 开始创号按钮 */}
        <Button
          onClick={handleGenerate}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          开始创号
        </Button>

        {/* 信息展示卡片 */}
        {userInfo && (
          <Card className="p-4 sm:p-6 space-y-4 rounded-2xl shadow-lg">
            <InfoField label="姓氏" value={userInfo.lastName} onCopy={() => copyToClipboard(userInfo.lastName, "姓氏")} copying={copying} />
            <div className="border-t border-gray-200" />
            
            <InfoField label="名字" value={userInfo.firstName} onCopy={() => copyToClipboard(userInfo.firstName, "名字")} copying={copying} />
            <div className="border-t border-gray-200" />
            
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-500">生日</span>
              <p className="text-base sm:text-lg font-medium">{userInfo.birthday}</p>
            </div>
            <div className="border-t border-gray-200" />
            
            <InfoField label="手机号" value={userInfo.phone} onCopy={() => copyToClipboard(userInfo.phone, "手机号")} copying={copying} />
            <div className="border-t border-gray-200" />
            
            <div className="space-y-2">
              <InfoField 
                label="邮箱" 
                value={userInfo.email} 
                onCopy={() => copyToClipboard(userInfo.email, "邮箱")} 
                onRefresh={regenerateEmail}
                isLink
                linkHref={`https://yopmail.com?${userInfo.emailUsername}`}
                copying={copying}
              />
              <p className="text-xs text-gray-500 mt-1">💡 点击邮箱地址可跳转查收验证码 不要在TG打开</p>
            </div>
          </Card>
        )}

        {/* Telegram 频道引流 */}
        <TelegramCard onCopy={() => copyToClipboard("@fang180", "神秘代码")} copying={copying} />
      </div>
    </div>
  );
};

export default Index;
