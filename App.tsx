import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type LineValue = 6 | 7 | 8 | 9;
type CoinValue = 2 | 3;

type CastRecord = {
  coins: CoinValue[];
  sum: LineValue;
};

type Page = "casting" | "gemini" | "answer";
type Language = "zh" | "en";

type GeminiResponse = {
  text?: string;
  finishReason?: string;
  error?: {
    message?: string;
  } | string;
};

type Hexagram = {
  number: number;
  hanzi: string;
  pinyin: string;
  english: string;
  theme: string;
  counsel: string;
};



const trigrams = {
  "111": "Qian",
  "110": "Dui",
  "101": "Li",
  "100": "Zhen",
  "011": "Xun",
  "010": "Kan",
  "001": "Gen",
  "000": "Kun"
} as const;

const trigramDetails: Record<string, { hanzi: string; element: string; direction: string; image: string }> = {
  Qian: { hanzi: "乾", element: "金", direction: "西北", image: "天" },
  Dui: { hanzi: "兑", element: "金", direction: "西方", image: "泽" },
  Li: { hanzi: "离", element: "火", direction: "南方", image: "火" },
  Zhen: { hanzi: "震", element: "木", direction: "东方", image: "雷" },
  Xun: { hanzi: "巽", element: "木", direction: "东南", image: "风" },
  Kan: { hanzi: "坎", element: "水", direction: "北方", image: "水" },
  Gen: { hanzi: "艮", element: "土", direction: "东北", image: "山" },
  Kun: { hanzi: "坤", element: "土", direction: "西南", image: "地" }
};

const kingWen: Record<string, Record<string, number>> = {
  Qian: { Qian: 1, Dui: 43, Li: 14, Zhen: 34, Xun: 9, Kan: 5, Gen: 26, Kun: 11 },
  Dui: { Qian: 10, Dui: 58, Li: 38, Zhen: 54, Xun: 61, Kan: 60, Gen: 41, Kun: 19 },
  Li: { Qian: 13, Dui: 49, Li: 30, Zhen: 55, Xun: 37, Kan: 63, Gen: 22, Kun: 36 },
  Zhen: { Qian: 25, Dui: 17, Li: 21, Zhen: 51, Xun: 42, Kan: 3, Gen: 27, Kun: 24 },
  Xun: { Qian: 44, Dui: 28, Li: 50, Zhen: 32, Xun: 57, Kan: 48, Gen: 18, Kun: 46 },
  Kan: { Qian: 6, Dui: 47, Li: 64, Zhen: 40, Xun: 59, Kan: 29, Gen: 4, Kun: 7 },
  Gen: { Qian: 33, Dui: 31, Li: 56, Zhen: 62, Xun: 53, Kan: 39, Gen: 52, Kun: 15 },
  Kun: { Qian: 12, Dui: 45, Li: 35, Zhen: 16, Xun: 20, Kan: 8, Gen: 23, Kun: 2 }
};

const hexagrams: Hexagram[] = [
  { number: 1, hanzi: "乾", pinyin: "Qian", english: "The Creative", theme: "pure creative force", counsel: "Act with clarity and discipline. Strong timing favors bold movement, but only when purpose leads pride." },
  { number: 2, hanzi: "坤", pinyin: "Kun", english: "The Receptive", theme: "devotion and support", counsel: "Receive, nourish, and let the situation ripen. Progress comes through patience, steadiness, and practical care." },
  { number: 3, hanzi: "屯", pinyin: "Zhun", english: "Difficulty at the Beginning", theme: "sprouting through chaos", counsel: "Early disorder is natural. Do not force certainty; gather helpers, simplify the first step, and keep going." },
  { number: 4, hanzi: "蒙", pinyin: "Meng", english: "Youthful Folly", theme: "learning and humility", counsel: "Ask sincerely and learn the basics. A clear teacher, rule, or method prevents wasted wandering." },
  { number: 5, hanzi: "需", pinyin: "Xu", english: "Waiting", theme: "nourished patience", counsel: "Wait actively. Prepare your resources, hold confidence, and do not cross the river before conditions are ready." },
  { number: 6, hanzi: "讼", pinyin: "Song", english: "Conflict", theme: "contention and limits", counsel: "Avoid escalation. Seek a fair boundary or mediator; winning too hard may cost more than yielding wisely." },
  { number: 7, hanzi: "师", pinyin: "Shi", english: "The Army", theme: "organized discipline", counsel: "Coordinate people and effort under a clear aim. Authority must be ethical, calm, and accountable." },
  { number: 8, hanzi: "比", pinyin: "Bi", english: "Holding Together", theme: "alliance and belonging", counsel: "Choose your center of loyalty. Real union forms around shared values, not convenience alone." },
  { number: 9, hanzi: "小畜", pinyin: "Xiao Xu", english: "Small Taming", theme: "gentle restraint", counsel: "Small refinements matter now. Do not force a breakthrough; shape the details until momentum returns." },
  { number: 10, hanzi: "履", pinyin: "Lu", english: "Treading", theme: "conduct under pressure", counsel: "Move carefully and respectfully. The path is safe when your manners are precise and your intent is clean." },
  { number: 11, hanzi: "泰", pinyin: "Tai", english: "Peace", theme: "harmony and flow", counsel: "Heaven and earth are communicating. Use this open season to build, reconcile, and share benefit." },
  { number: 12, hanzi: "否", pinyin: "Pi", english: "Standstill", theme: "blocked exchange", counsel: "When channels are closed, preserve integrity. Do less, protect essentials, and wait for sincerity to return." },
  { number: 13, hanzi: "同人", pinyin: "Tong Ren", english: "Fellowship", theme: "shared fire", counsel: "Join with people beyond your usual circle. Open purpose creates strength; private motives weaken the bond." },
  { number: 14, hanzi: "大有", pinyin: "Da You", english: "Great Possession", theme: "abundance with responsibility", counsel: "Resources are present. Use them generously and wisely, because prosperity is tested by how it is held." },
  { number: 15, hanzi: "谦", pinyin: "Qian", english: "Modesty", theme: "humble balance", counsel: "Lower the mountain and raise the valley. Modesty attracts support and corrects excess without drama." },
  { number: 16, hanzi: "豫", pinyin: "Yu", english: "Enthusiasm", theme: "inspired movement", counsel: "Energy gathers around a rhythm. Prepare before celebrating, then let sincere enthusiasm mobilize others." },
  { number: 17, hanzi: "随", pinyin: "Sui", english: "Following", theme: "adaptive loyalty", counsel: "Follow what is timely and true. Let go of stale control, but do not follow blindly." },
  { number: 18, hanzi: "蛊", pinyin: "Gu", english: "Work on What Is Spoiled", theme: "repairing decay", counsel: "Something old needs honest repair. Name the root cause, clean it carefully, and restore trust through action." },
  { number: 19, hanzi: "临", pinyin: "Lin", english: "Approach", theme: "warm leadership", counsel: "Move closer with generosity and attention. Good influence grows when it remains humble before success." },
  { number: 20, hanzi: "观", pinyin: "Guan", english: "Contemplation", theme: "seeing and being seen", counsel: "Step back and observe the pattern. Your example is also being watched, so align appearance with truth." },
  { number: 21, hanzi: "噬嗑", pinyin: "Shi He", english: "Biting Through", theme: "decisive justice", counsel: "Remove the obstruction. Clear rules and proportionate consequences restore order." },
  { number: 22, hanzi: "贲", pinyin: "Bi", english: "Grace", theme: "beauty and form", counsel: "Presentation matters, but it must serve substance. Add elegance without hiding the real condition." },
  { number: 23, hanzi: "剥", pinyin: "Bo", english: "Splitting Apart", theme: "stripping away", counsel: "Do not prop up what is collapsing. Protect the core, release excess, and avoid risky expansion." },
  { number: 24, hanzi: "复", pinyin: "Fu", english: "Return", theme: "renewal after decline", counsel: "A turning point begins quietly. Return to the right path in small, repeatable steps." },
  { number: 25, hanzi: "无妄", pinyin: "Wu Wang", english: "Innocence", theme: "natural correctness", counsel: "Act without scheming. When motive is clean, respond to events directly and keep life simple." },
  { number: 26, hanzi: "大畜", pinyin: "Da Xu", english: "Great Taming", theme: "stored power", counsel: "Hold strength in reserve. Study, train, and restrain appetite so power becomes useful." },
  { number: 27, hanzi: "颐", pinyin: "Yi", english: "Nourishment", theme: "what feeds life", counsel: "Watch what you take in and what you give out. Words, food, habits, and attention shape fate." },
  { number: 28, hanzi: "大过", pinyin: "Da Guo", english: "Great Exceeding", theme: "critical overload", counsel: "The beam is under strain. Make a decisive adjustment before pressure turns into collapse." },
  { number: 29, hanzi: "坎", pinyin: "Kan", english: "The Abysmal Water", theme: "repeated danger", counsel: "Danger is real, but skill grows through steady passage. Keep your heart truthful and your steps measured." },
  { number: 30, hanzi: "离", pinyin: "Li", english: "The Clinging Fire", theme: "clarity and dependence", counsel: "Attach yourself to what gives light. Clarity needs fuel, care, and the courage to see plainly." },
  { number: 31, hanzi: "咸", pinyin: "Xian", english: "Influence", theme: "mutual attraction", counsel: "Influence works through sensitivity, not force. Respond gently and let sincerity move the other side." },
  { number: 32, hanzi: "恒", pinyin: "Heng", english: "Duration", theme: "lasting commitment", counsel: "Stay consistent without becoming rigid. A durable path adapts while keeping its vow." },
  { number: 33, hanzi: "遁", pinyin: "Dun", english: "Retreat", theme: "strategic withdrawal", counsel: "Step back with dignity. Retreat is not defeat when it preserves strength and timing." },
  { number: 34, hanzi: "大壮", pinyin: "Da Zhuang", english: "Great Power", theme: "strength under law", counsel: "Power is available. Use it with restraint, because force without correctness becomes trouble." },
  { number: 35, hanzi: "晋", pinyin: "Jin", english: "Progress", theme: "rising visibility", counsel: "Advance into the light. Recognition grows when you serve a purpose larger than display." },
  { number: 36, hanzi: "明夷", pinyin: "Ming Yi", english: "Darkening of the Light", theme: "hidden brightness", counsel: "Protect your inner light in a difficult environment. Be cautious, quiet, and faithful to what is true." },
  { number: 37, hanzi: "家人", pinyin: "Jia Ren", english: "The Family", theme: "roles and household order", counsel: "Set the home pattern right. Clear roles, honest speech, and daily reliability create harmony." },
  { number: 38, hanzi: "睽", pinyin: "Kui", english: "Opposition", theme: "difference and perspective", counsel: "Differences need not break the bond. Seek small agreements and respect distinct viewpoints." },
  { number: 39, hanzi: "蹇", pinyin: "Jian", english: "Obstruction", theme: "difficulty on the road", counsel: "Do not charge into resistance. Turn toward wise help, correct the route, and conserve energy." },
  { number: 40, hanzi: "解", pinyin: "Xie", english: "Deliverance", theme: "release after tension", counsel: "Untie the knot. Forgive what can be forgiven, act quickly where action is needed, and simplify." },
  { number: 41, hanzi: "损", pinyin: "Sun", english: "Decrease", theme: "sacrifice and pruning", counsel: "Reduce what is excessive. A sincere small offering can restore balance better than a grand gesture." },
  { number: 42, hanzi: "益", pinyin: "Yi", english: "Increase", theme: "growth through generosity", counsel: "Increase flows where benefit is shared. Move promptly and use gains to support others." },
  { number: 43, hanzi: "夬", pinyin: "Guai", english: "Breakthrough", theme: "resolute declaration", counsel: "State the truth clearly without aggression. Remove corruption by being firm, public, and fair." },
  { number: 44, hanzi: "姤", pinyin: "Gou", english: "Coming to Meet", theme: "powerful encounter", counsel: "An unexpected influence appears. Meet it consciously, but do not let fascination take command." },
  { number: 45, hanzi: "萃", pinyin: "Cui", english: "Gathering Together", theme: "assembly and shared focus", counsel: "Bring people and resources together around a clear center. Ritual, respect, and preparation matter." },
  { number: 46, hanzi: "升", pinyin: "Sheng", english: "Pushing Upward", theme: "gradual ascent", counsel: "Grow like wood through earth. Patient effort, good mentors, and steady ambition bring elevation." },
  { number: 47, hanzi: "困", pinyin: "Kun", english: "Oppression", theme: "exhaustion and constraint", counsel: "When words fail, preserve the heart. Reduce strain, hold dignity, and wait for the opening." },
  { number: 48, hanzi: "井", pinyin: "Jing", english: "The Well", theme: "shared source", counsel: "Return to the source that nourishes everyone. Maintain the system, not just the bucket." },
  { number: 49, hanzi: "革", pinyin: "Ge", english: "Revolution", theme: "timely transformation", counsel: "Change is justified when timing, trust, and necessity align. Make reform clear and humane." },
  { number: 50, hanzi: "鼎", pinyin: "Ding", english: "The Cauldron", theme: "cultivation and offering", counsel: "Transform raw material into nourishment. Culture, craft, and disciplined care elevate the situation." },
  { number: 51, hanzi: "震", pinyin: "Zhen", english: "The Arousing Thunder", theme: "shock and awakening", counsel: "Shock wakes the spirit. Stay composed, correct what is urgent, and let fear become alertness." },
  { number: 52, hanzi: "艮", pinyin: "Gen", english: "Keeping Still", theme: "stillness and boundaries", counsel: "Stop at the right place. Quiet attention helps you separate true responsibility from restless impulse." },
  { number: 53, hanzi: "渐", pinyin: "Jian", english: "Development", theme: "gradual progress", counsel: "Advance step by step. Durable growth follows proper sequence, patience, and earned trust." },
  { number: 54, hanzi: "归妹", pinyin: "Gui Mei", english: "The Marrying Maiden", theme: "imperfect position", counsel: "You may not control the arrangement. Know your place clearly and avoid impulsive bargains." },
  { number: 55, hanzi: "丰", pinyin: "Feng", english: "Abundance", theme: "fullness at noon", counsel: "Abundance is bright but brief. Use the peak well, decide clearly, and do not fear decline." },
  { number: 56, hanzi: "旅", pinyin: "Lu", english: "The Wanderer", theme: "travel and impermanence", counsel: "You are a guest in this situation. Be courteous, observant, and light with possessions and claims." },
  { number: 57, hanzi: "巽", pinyin: "Xun", english: "The Gentle Wind", theme: "penetrating influence", counsel: "Small repeated influence enters deeply. Be consistent, tactful, and exact about your intention." },
  { number: 58, hanzi: "兑", pinyin: "Dui", english: "The Joyous Lake", theme: "joy and exchange", counsel: "Joy opens communication. Keep pleasure sincere, shared, and free of manipulation." },
  { number: 59, hanzi: "涣", pinyin: "Huan", english: "Dispersion", theme: "dissolving division", counsel: "Scatter what has hardened. Shared purpose and sincere feeling can reunite what drifted apart." },
  { number: 60, hanzi: "节", pinyin: "Jie", english: "Limitation", theme: "healthy boundaries", counsel: "Set limits that make life possible. Bitter restriction fails; clear and humane structure succeeds." },
  { number: 61, hanzi: "中孚", pinyin: "Zhong Fu", english: "Inner Truth", theme: "trust from the center", counsel: "Sincerity reaches across distance. Speak from the center and listen for the center in others." },
  { number: 62, hanzi: "小过", pinyin: "Xiao Guo", english: "Small Exceeding", theme: "careful smallness", counsel: "Small matters require extra care. Keep low, attend to details, and avoid grand gestures." },
  { number: 63, hanzi: "既济", pinyin: "Ji Ji", english: "After Completion", theme: "order after crossing", counsel: "The task is complete but not secure. Maintain vigilance; endings need careful tending." },
  { number: 64, hanzi: "未济", pinyin: "Wei Ji", english: "Before Completion", theme: "not yet across", counsel: "The crossing is near, but the order is unfinished. Move carefully and place each step correctly." }
];

const byNumber = Object.fromEntries(hexagrams.map((hexagram) => [hexagram.number, hexagram])) as Record<number, Hexagram>;
const geminiBackendUrl = "https://iching-fortune-app.onrender.com/api/iching";

const chineseReadings: Record<number, { name: string; theme: string; counsel: string }> = {
  1: { name: "乾为天", theme: "刚健、自强、开创", counsel: "时机有力，宜主动推进。凡事先正其心，再用其势；刚中有度，成事更稳。" },
  2: { name: "坤为地", theme: "顺承、包容、厚德", counsel: "宜以柔顺承载局面，耐心培育。先稳根基，再谈扩张，贵在踏实。" },
  3: { name: "水雷屯", theme: "初生艰难、蓄势待发", counsel: "开始阶段多阻滞，不必急求圆满。整理资源，寻得助力，小步推进。" },
  4: { name: "山水蒙", theme: "启蒙、求学、去惑", counsel: "此时贵在虚心请教，先明规则与方向。心不诚则问无益，心诚则有开悟。" },
  5: { name: "水天需", theme: "等待、养势、守正", counsel: "宜等待成熟之机，不可躁进。准备粮草，守住信心，时至自然可行。" },
  6: { name: "天水讼", theme: "争执、分歧、止争", counsel: "有争端之象，宜早立界限、求公正调和。强争未必得利，退一步可保全局。" },
  7: { name: "地水师", theme: "组织、纪律、统率", counsel: "事需有章法与领导。众人同心则可成，但权责必须清楚，行事不可失正。" },
  8: { name: "水地比", theme: "亲比、结盟、归属", counsel: "宜择善而从，寻找可信的合作中心。关系贵在真诚，不宜两面摇摆。" },
  9: { name: "风天小畜", theme: "小有积蓄、柔制刚", counsel: "大事未可强成，宜修细节、蓄小势。以柔和方式约束冲动，可待云开。" },
  10: { name: "天泽履", theme: "谨慎行事、守礼避险", counsel: "如履虎尾，宜谨慎有礼。只要行为端正、分寸得当，虽有压力亦可安然。" },
  11: { name: "地天泰", theme: "通泰、和合、上下一心", counsel: "天地交泰，局面顺畅。宜趁势建设、沟通、修好关系，但不可因顺而骄。" },
  12: { name: "天地否", theme: "闭塞、不通、守节", counsel: "气机不通，暂不宜强求。守住原则，减少消耗，等待局面重新流动。" },
  13: { name: "天火同人", theme: "同道、合作、公心", counsel: "宜与志同道合者同行。公正开放则人心可聚，私心太重则合作难久。" },
  14: { name: "火天大有", theme: "富有、光明、责任", counsel: "资源与机会俱足。宜以德配位，善用所得，越能分享越能长久。" },
  15: { name: "地山谦", theme: "谦逊、平衡、减满", counsel: "谦则受益，满则招损。放低姿态、实事求是，反而容易得到支持。" },
  16: { name: "雷地豫", theme: "喜悦、动员、预备", counsel: "人心可振，宜先预备后行动。热情能聚众，但不可只顾兴奋而忘根基。" },
  17: { name: "泽雷随", theme: "随时、顺势、择从", counsel: "宜顺应时势，跟随正道与可信之人。随不是盲从，要保有判断。" },
  18: { name: "山风蛊", theme: "整治、修复、除弊", counsel: "旧病需治，旧账需清。看见根源后果断修正，拖延只会使问题加深。" },
  19: { name: "地泽临", theme: "临近、关照、上进", counsel: "机会渐近，宜以诚意靠近人事。得势时更要谦和，方能长久。" },
  20: { name: "风地观", theme: "观察、反省、示范", counsel: "先观其象，再定其行。你在观察别人，也被别人观察，言行要一致。" },
  21: { name: "火雷噬嗑", theme: "咬合、决断、除障", counsel: "中间有阻碍，必须明辨是非、果断处理。规则清楚，事情才能恢复秩序。" },
  22: { name: "山火贲", theme: "文饰、美化、外形", counsel: "外在形式有帮助，但不可胜过实质。适度修饰可增光，过度包装则失真。" },
  23: { name: "山地剥", theme: "剥落、衰退、保本", counsel: "形势有削弱之象，不宜冒进。舍弃浮华，保存核心，静待复苏。" },
  24: { name: "地雷复", theme: "回归、复始、转机", counsel: "转机正在萌生。回到正道，从小处重新开始，勿急勿乱。" },
  25: { name: "天雷无妄", theme: "无妄、自然、守真", counsel: "宜顺其自然，不可妄动妄求。动机纯正，反而能避开无端之灾。" },
  26: { name: "山天大畜", theme: "大蓄、积累、节制", counsel: "力量正在积蓄，宜学习、储备、克制欲望。能止而后能大行。" },
  27: { name: "山雷颐", theme: "养正、饮食、言语", counsel: "注意你所滋养的东西：饮食、言语、习惯与念头。养正则运势渐正。" },
  28: { name: "泽风大过", theme: "过重、非常、改梁", counsel: "压力已超常，必须调整结构。勇于处理关键处，才可避免倾覆。" },
  29: { name: "坎为水", theme: "险难、反复、守信", counsel: "险象反复，宜谨慎前行。守住诚信与节奏，一步一步穿过险处。" },
  30: { name: "离为火", theme: "光明、依附、明辨", counsel: "宜依附正当之光，保持清明。看清事实，也要给光明持续的燃料。" },
  31: { name: "泽山咸", theme: "感应、吸引、相互影响", counsel: "以诚相感，不宜强迫。柔和回应，心意自然能传达。" },
  32: { name: "雷风恒", theme: "恒久、坚持、守常", counsel: "贵在持久稳定。可调整方法，但不可轻易改变初心与承诺。" },
  33: { name: "天山遁", theme: "退避、保全、审时", counsel: "宜有尊严地后退。退不是败，而是保存力量，等待更合适的时机。" },
  34: { name: "雷天大壮", theme: "强盛、用力、守正", counsel: "力量正盛，但越强越要守正。不可逞强，正当使用力量才有利。" },
  35: { name: "火地晋", theme: "晋升、进展、显明", counsel: "有上升与被看见之象。宜光明正大地前进，以服务换取认可。" },
  36: { name: "地火明夷", theme: "光受伤、韬晦、守内", counsel: "环境不利，宜藏明于内。谨慎低调，保护真实能力与信念。" },
  37: { name: "风火家人", theme: "家道、秩序、内务", counsel: "先正其家，再及其外。角色清楚、言语可靠，关系自然安定。" },
  38: { name: "火泽睽", theme: "相违、异见、求同", counsel: "意见相左，不必强求完全一致。先求小同，尊重差异，局面可缓和。" },
  39: { name: "水山蹇", theme: "艰阻、绕行、求助", counsel: "前路有阻，不宜硬闯。回头修路，向有智慧者求助，反而有利。" },
  40: { name: "雷水解", theme: "解脱、舒缓、散结", counsel: "紧张可解。该宽恕的宽恕，该行动的行动，越简单越能脱困。" },
  41: { name: "山泽损", theme: "减少、取舍、诚意", counsel: "宜减损多余之物。少一点欲望，多一点诚意，平衡会回来。" },
  42: { name: "风雷益", theme: "增益、成长、利他", counsel: "有增长之象，宜及时行动。所得若能利人，益处更大更久。" },
  43: { name: "泽天夬", theme: "决断、宣告、去邪", counsel: "必须明确表态，去除不正之事。坚定但不可粗暴，公开公正最有力。" },
  44: { name: "天风姤", theme: "相遇、诱惑、突来之缘", counsel: "突然而来的影响不可轻忽。可以相见，但要守住主位与边界。" },
  45: { name: "泽地萃", theme: "聚集、会合、共同目标", counsel: "宜聚人聚财聚心。中心清楚、礼数周到，众力可成大事。" },
  46: { name: "地风升", theme: "上升、渐进、培植", counsel: "如木升于地，宜稳步向上。亲近良师，坚持累积，自有提升。" },
  47: { name: "泽水困", theme: "困顿、受限、守心", counsel: "外在受困，言语未必有用。先保精神与底线，等待出口出现。" },
  48: { name: "水风井", theme: "井养、根源、公共资源", counsel: "回到能滋养众人的根源。修井比换桶重要，维护系统才有长远。" },
  49: { name: "泽火革", theme: "革新、变易、去旧", counsel: "改变有其必要，但要看准时机。让人信服的改革，必须清楚且合情。" },
  50: { name: "火风鼎", theme: "鼎新、成器、养贤", counsel: "原料可化为美味，事情可被提升。以制度、技艺与修养成就新局。" },
  51: { name: "震为雷", theme: "震动、惊醒、行动", counsel: "突发震动使人清醒。先稳住心，再处理急事，惊而不乱则吉。" },
  52: { name: "艮为山", theme: "止、静、边界", counsel: "宜止于所当止。安静观察，分清责任与欲望，停止也是一种行动。" },
  53: { name: "风山渐", theme: "渐进、礼序、成长", counsel: "宜循序渐进，不可跳级。关系与事业都需要按步骤建立信任。" },
  54: { name: "雷泽归妹", theme: "位置不正、随从、谨慎", counsel: "局面未必由你主导，宜认清位置。不可冲动交易，也不可贪图一时。" },
  55: { name: "雷火丰", theme: "丰盛、光大、盛极", counsel: "此刻明亮而丰盛，宜果断使用高峰期。盛时也要想到退路。" },
  56: { name: "火山旅", theme: "旅人、暂居、守礼", counsel: "你像旅人处于异地，宜谦和有礼、少作占有。轻装而行更顺。" },
  57: { name: "巽为风", theme: "入、柔顺、渗透", counsel: "柔风入物，贵在持续。小而准的影响，久了能改变局面。" },
  58: { name: "兑为泽", theme: "喜悦、交流、和悦", counsel: "喜悦能打开关系。以真诚交流，不以甜言操控，快乐才有根。" },
  59: { name: "风水涣", theme: "涣散、化解、重新凝聚", counsel: "分散与隔阂可被化开。用共同目标与真情，把人心重新聚起来。" },
  60: { name: "水泽节", theme: "节制、界限、制度", counsel: "需要限制，但限制要合理。太苦则难久，清楚而适度最好。" },
  61: { name: "风泽中孚", theme: "诚信、内在真实、感通", counsel: "内心真实可以感通远近。说真话，也听见别人心中的真意。" },
  62: { name: "雷山小过", theme: "小事过谨、低飞、细节", counsel: "小事需格外谨慎。宜低调、细致、守分，不宜作大动作。" },
  63: { name: "水火既济", theme: "已成、守成、防变", counsel: "事情已近完成，但完成后最怕松懈。守好细节，方能长保其成。" },
  64: { name: "火水未济", theme: "未成、将济、慎终", counsel: "尚未完成，离成功不远。每一步都要放准位置，慎终则可成。" }
};

function tossCoins(): CastRecord {
  const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? 2 : 3)) as CoinValue[];
  const sum = coins.reduce((total, coin) => total + coin, 0) as LineValue;
  return { coins, sum };
}

function lineToBit(line: LineValue): 0 | 1 {
  return line === 7 || line === 9 ? 1 : 0;
}

function changedLineToBit(line: LineValue): 0 | 1 {
  if (line === 6) return 1;
  if (line === 9) return 0;
  return lineToBit(line);
}

function hexagramFromLines(lines: LineValue[], changed = false): Hexagram {
  const bits = lines.map((line) => (changed ? changedLineToBit(line) : lineToBit(line))).join("");
  const lower = trigrams[bits.slice(0, 3) as keyof typeof trigrams];
  const upper = trigrams[bits.slice(3, 6) as keyof typeof trigrams];
  return byNumber[kingWen[lower][upper]];
}

function trigramProfileFromLines(lines: LineValue[], changed = false) {
  const bits = lines.map((line) => (changed ? changedLineToBit(line) : lineToBit(line))).join("");
  const lower = trigrams[bits.slice(0, 3) as keyof typeof trigrams];
  const upper = trigrams[bits.slice(3, 6) as keyof typeof trigrams];
  return {
    lower,
    lowerDetails: trigramDetails[lower],
    upper,
    upperDetails: trigramDetails[upper]
  };
}

function yaoLabel(line: LineValue): string {
  if (line === 6) return "老阴，变爻";
  if (line === 7) return "少阳";
  if (line === 8) return "少阴";
  return "老阳，变爻";
}

function lineNature(line: LineValue): string {
  return line % 2 === 1 ? "阳爻" : "阴爻";
}

function buildGeminiPrompt({
  question,
  primary,
  relating,
  changingLines,
  casts,
  language
}: {
  question: string;
  primary: Hexagram;
  relating: Hexagram;
  changingLines: Array<{ line: LineValue; position: number }>;
  casts: CastRecord[];
  language: Language;
}) {
  const primaryReading = chineseReadings[primary.number];
  const relatingReading = chineseReadings[relating.number];
  const primaryTrigrams = trigramProfileFromLines(casts.map((cast) => cast.sum));
  const relatingTrigrams = trigramProfileFromLines(casts.map((cast) => cast.sum), true);
  
  const changingText = changingLines.length
    ? changingLines.map(({ line, position }) => `第${position}爻：${yaoLabel(line)}`).join("；")
    : "无变爻";

  return `# Role & Objective
你是一位精通《易经》、六十四卦、爻变、象数与体用五行的国学解卦顾问。

你的任务是根据系统已经计算好的：

- 用户问题

- 本卦

- 变爻

- 之卦

直接进行判断。

禁止重新计算卦象。

禁止复述铜钱记录。

禁止质疑 App 给出的本卦、变爻与之卦。

禁止长篇讲解易经历史。

结论要清楚，判断要落地。

# 解卦优先级

判断必须遵循以下顺序：

1. 本卦主题

2. 动爻变化

3. 之卦趋势

4. 上下卦关系

5. 五行生克

如果五行结论与卦义冲突，以卦义为准。

# 问题分类

先判断用户问题属于哪一类：

感情、婚姻、事业、财运、投资、体育赛事、学业、健康、人际关系、综合运势。

不同问题要使用不同语言：

- 感情：缘分、沟通、复合、阻隔、态度变化

- 事业：机会、压力、贵人、竞争、职位变化

- 财运/投资：趋势、风险、守成、进退时机

- 体育：气势、攻防节奏、关键转折、后段走势

- 健康：状态、调养、风险提醒，不作医学诊断

# 体育赛事规则

如果问题涉及比赛、胜负、球队、比分、冠军、晋级：

1. 必须给出明确倾向。

2. 不要只说“五五开”。

3. 不要编造实时比分、伤病、新闻、盘口。

4. 不要建议下注。

5. 可以说“胜面较大”“更可能”“倾向于”。

6. 最终必须点名一方。

# 输出要求

语言：${language === "zh" ? "简体中文" : "English"}

风格：像资深易经老师，直接、沉稳、具体。

字数：通常控制在 600 到 900 个中文字符。

不要输出 Markdown 粗体符号。

不要复述起卦记录。

不要重新解释三枚铜钱规则。

# 输出结构

请严格按以下结构输出：

1. 综合判断

先用一句话给出核心结论。

2. 本卦分析

说明当前局势、优势、阻力。

3. 变爻分析

说明关键转折、变化点、风险或机会。

4. 之卦趋势

说明后续发展与最终走向。

5. 具体判断

结合用户问题，给出明确答案。

6. 最终结论

最终倾向：

卦象强度：★★★★★ / ★★★★☆ / ★★★☆☆ / ★★☆☆☆ / ★☆☆☆☆

时间窗口：短期 / 中期 / 长期

提醒：本解读属于传统文化与娱乐参考，不代表确定结果。

# 起卦信息

用户问题：

${question.trim() || "未填写具体问题，请按当下所念之事解读。"}

本卦：

第${primary.number}卦，${primaryReading.name}，${primary.hanzi}

主题：${primaryReading.theme}

本卦结构：上卦${primaryTrigrams.upperDetails.hanzi}（${primaryTrigrams.upperDetails.image}，五行${primaryTrigrams.upperDetails.element}），下卦${primaryTrigrams.lowerDetails.hanzi}（${primaryTrigrams.lowerDetails.image}，五行${primaryTrigrams.lowerDetails.element}）

本卦简义：${primaryReading.counsel}

变爻：

${changingText}

之卦：

第${relating.number}卦，${relatingReading.name}，${relating.hanzi}

主题：${relatingReading.theme}

之卦结构：上卦${relatingTrigrams.upperDetails.hanzi}（${relatingTrigrams.upperDetails.image}，五行${relatingTrigrams.upperDetails.element}），下卦${relatingTrigrams.lowerDetails.hanzi}（${relatingTrigrams.lowerDetails.image}，五行${relatingTrigrams.lowerDetails.element}）

之卦简义：${relatingReading.counsel}

请直接开始解卦。`;
}

function splitAnswerParagraphs(answer: string) {
  return answer
    .split(/\n{2,}|\r\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function HexLine({ line }: { line: LineValue }) {
  const yang = line === 7 || line === 9;
  const changing = line === 6 || line === 9;
  return (
    <View style={styles.lineRow}>
      {yang ? (
        <View style={[styles.solidLine, changing && styles.changingLine]} />
      ) : (
        <View style={styles.brokenWrap}>
          <View style={[styles.halfLine, changing && styles.changingLine]} />
          <View style={[styles.halfLine, changing && styles.changingLine]} />
        </View>
      )}
    </View>
  );
}

function Coin({ value }: { value: CoinValue }) {
  const isFront = value === 3;
  return (
    <View style={[styles.coin, isFront ? styles.coinFront : styles.coinBack]}>
      <Text style={styles.coinFace}>{isFront ? "正" : "反"}</Text>
      <Text style={styles.coinValue}>{value}</Text>
    </View>
  );
}

function CastHistory({ casts }: { casts: CastRecord[] }) {
  if (casts.length === 0) {
    return (
      <View style={styles.emptyPanel}>
        <Text style={styles.emptyTitle}>请先静心</Text>
        <Text style={styles.emptyCopy}>
          心中默念所问之事，怀着虔诚点击起爻。每次三枚铜钱，正面为3，反面为2，连续六次后成卦。
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.castsPanel}>
      <Text style={styles.panelLabel}>起卦记录</Text>
      {casts.map((cast, index) => (
        <View key={`${cast.sum}-${index}`} style={styles.castRecord}>
          <View style={styles.castRecordHeader}>
            <Text style={styles.castTitle}>第{index + 1}爻</Text>
            <Text style={styles.castSummary}>合计 {cast.sum} · {lineNature(cast.sum)}</Text>
          </View>
          <View style={styles.coinRow}>
            {cast.coins.map((coin, coinIndex) => (
              <Coin key={`${coin}-${coinIndex}`} value={coin} />
            ))}
          </View>
          <View style={styles.recordLine}>
            <HexLine line={cast.sum} />
          </View>
        </View>
      ))}
    </View>
  );
}

function HexagramCard({
  title,
  hexagram,
  lines,
  showLines
}: {
  title: string;
  hexagram: Hexagram;
  lines?: LineValue[];
  showLines?: boolean;
}) {
  const reading = chineseReadings[hexagram.number];
  return (
    <View style={styles.resultPanel}>
      <Text style={styles.panelLabel}>{title}</Text>
      <View style={styles.hexHeader}>
        <Text style={styles.hexNumber}>第{hexagram.number}卦</Text>
        <Text style={styles.hexHanzi}>{hexagram.hanzi}</Text>
        <View style={styles.hexTitleWrap}>
          <Text style={styles.hexTitle}>{reading.name}</Text>
          <Text style={styles.hexSubtitle}>{hexagram.pinyin} · {reading.theme}</Text>
        </View>
      </View>
      {showLines && lines ? (
        <View style={styles.hexLines}>
          {[...lines].reverse().map((line, index) => (
            <HexLine key={`${line}-${index}`} line={line} />
          ))}
        </View>
      ) : null}
      <Text style={styles.counsel}>{reading.counsel}</Text>
    </View>
  );
}

export default function App() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState<Language>("zh");
  const [casts, setCasts] = useState<CastRecord[]>([]);
  const [geminiAnswer, setGeminiAnswer] = useState("");
  const [geminiError, setGeminiError] = useState("");
  const [geminiFinishReason, setGeminiFinishReason] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [page, setPage] = useState<Page>("casting");
  const lines = useMemo(() => casts.map((cast) => cast.sum), [casts]);
  const completedLines = lines.length === 6 ? lines : null;

  const reading = useMemo(() => {
    if (!completedLines) return null;
    return {
      primary: hexagramFromLines(completedLines),
      relating: hexagramFromLines(completedLines, true),
      changingLines: completedLines
        .map((line, index) => ({ line, position: index + 1 }))
        .filter(({ line }) => line === 6 || line === 9)
    };
  }, [completedLines]);

  const cast = () => {
    if (casts.length >= 6) {
      setCasts([tossCoins()]);
      setGeminiAnswer("");
      setGeminiError("");
      setGeminiFinishReason("");
      setPage("casting");
      return;
    }
    setCasts((currentCasts) => [...currentCasts, tossCoins()]);
    setGeminiAnswer("");
    setGeminiError("");
    setGeminiFinishReason("");
  };

  const endGame = () => {
    setQuestion("");
    setCasts([]);
    setGeminiAnswer("");
    setGeminiError("");
    setGeminiFinishReason("");
    setGeminiLoading(false);
    setPage("casting");
  };

  const askGemini = async () => {
    if (!reading || !completedLines) return;

    setGeminiLoading(true);
    setGeminiAnswer("");
    setGeminiError("");
    setGeminiFinishReason("");

    try {
      const prompt = buildGeminiPrompt({
        question,
        primary: reading.primary,
        relating: reading.relating,
        changingLines: reading.changingLines,
        casts,
        language
      });
      const response = await fetch(geminiBackendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt
        })
      });
      const data = (await response.json()) as GeminiResponse;

      if (!response.ok) {
        const message = typeof data.error === "string" ? data.error : data.error?.message;
        throw new Error(message || "后台请求失败，请检查服务器或网络。");
      }

      const text = data.text?.trim();
      if (!text) {
        throw new Error("没有返回解卦内容，请稍后重试。");
      }
      setGeminiAnswer(text);
      setGeminiFinishReason(data.finishReason || "");
      setPage("answer");
    } catch (error) {
      setGeminiError(error instanceof Error ? error.message : "解卦失败，请稍后重试。");
    } finally {
      setGeminiLoading(false);
    }
  };

  if (page === "gemini" && reading && completedLines) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.pageHeader}>
            <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]} onPress={() => setPage("casting")}>
              <Text style={styles.backButtonText}>返回起卦</Text>
            </Pressable>
            <Text style={styles.appName}>Gemini 实时解卦</Text>
            <Text style={styles.pageHeadline}>结合本卦、变爻与之卦，生成完整解读。</Text>
          </View>

          {question.trim().length > 0 ? <Text style={styles.questionEcho}>所问：{question.trim()}</Text> : null}

          <View style={styles.geminiSummaryGrid}>
            <HexagramCard title="本卦" hexagram={reading.primary} lines={completedLines} showLines />
            <HexagramCard title="之卦" hexagram={reading.relating} />
          </View>

          <View style={styles.changesPanel}>
            <Text style={styles.panelLabel}>变爻</Text>
            {reading.changingLines.length > 0 ? (
              reading.changingLines.map(({ line, position }) => (
                <Text key={position} style={styles.changeText}>
                  第{position}爻：{yaoLabel(line)}
                </Text>
              ))
            ) : (
              <Text style={styles.changeText}>无变爻。此卦以本卦为主，表示局面较为稳定，宜细看本卦之意。</Text>
            )}
          </View>

          <View style={styles.geminiPanel}>
            <Text style={styles.panelLabel}>解卦</Text>
            <Text style={styles.geminiHint}>请点击开始解卦。</Text>
            <Pressable
              style={({ pressed }) => [styles.geminiButton, geminiLoading && styles.disabledButton, pressed && styles.buttonPressed]}
              onPress={askGemini}
              disabled={geminiLoading}
            >
              <Text style={styles.geminiButtonText}>{geminiLoading ? " 解卦中..." : "开始  解卦"}</Text>
            </Pressable>
            {geminiAnswer ? (
              <Pressable
                style={({ pressed }) => [styles.secondaryFullButton, pressed && styles.buttonPressed]}
                onPress={() => setPage("answer")}
              >
                <Text style={styles.secondaryFullButtonText}>查看完整解卦结果</Text>
              </Pressable>
            ) : null}
            {geminiError ? <Text style={styles.geminiError}>{geminiError}</Text> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (page === "answer" && reading && completedLines) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.answerContent}>
          <View style={styles.pageHeader}>
            <View style={styles.answerNavRow}>
              <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]} onPress={() => setPage("gemini")}>
                <Text style={styles.backButtonText}>返回解卦</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]} onPress={() => setPage("casting")}>
                <Text style={styles.backButtonText}>返回起卦</Text>
              </Pressable>
            </View>
            <Text style={styles.appName}>完整解卦结果</Text>
            <Text style={styles.pageHeadline}> 已根据本卦、变爻与之卦生成解读。</Text>
          </View>

          {question.trim().length > 0 ? <Text style={styles.questionEcho}>所问：{question.trim()}</Text> : null}

          <View style={styles.answerPanel}>
            <Text style={styles.panelLabel}> 解卦全文</Text>
            {geminiFinishReason && geminiFinishReason !== "STOP" ? (
              <Text style={styles.answerWarning}> 返回状态：{geminiFinishReason}。如果内容仍不完整，请点“返回解卦”后重新解卦。</Text>
            ) : null}
            {splitAnswerParagraphs(geminiAnswer).map((paragraph, index) => (
              <Text key={`${index}-${paragraph.slice(0, 12)}`} selectable style={styles.answerParagraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>易经占卜</Text>
          <Text style={styles.headline}>心诚一问，六爻成卦，观其变化。</Text>
        </View>

        <View style={styles.askPanel}>
          <Text style={styles.inputLabel}>你的问题</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="我想请问关于..."
            placeholderTextColor="#8b8173"
            multiline
            style={styles.input}
          />
          <View style={styles.languageRow}>
  <Pressable
    style={[
      styles.languageButton,
      language === "zh" && styles.languageButtonActive
    ]}
    onPress={() => setLanguage("zh")}
  >
    <Text style={styles.languageButtonText}>中文</Text>
  </Pressable>

  <Pressable
    style={[
      styles.languageButton,
      language === "en" && styles.languageButtonActive
    ]}
    onPress={() => setLanguage("en")}
  >
    <Text style={styles.languageButtonText}>English</Text>
  </Pressable>
</View>
          <View style={styles.actionRow}>
            <Pressable style={({ pressed }) => [styles.castButton, casts.length > 0 && styles.actionButton, pressed && styles.buttonPressed]} onPress={cast}>
              <Text style={styles.castButtonText}>
                {casts.length >= 6 ? "重新开始起爻" : `点击起第${casts.length + 1}爻`}
              </Text>
            </Pressable>
            {casts.length > 0 ? (
              <Pressable style={({ pressed }) => [styles.endButton, styles.actionButton, pressed && styles.buttonPressed]} onPress={endGame}>
                <Text style={styles.endButtonText}>结束游戏</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.progressPanel}>
          <Text style={styles.progressText}>已起 {casts.length} / 6 爻</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(casts.length / 6) * 100}%` }]} />
          </View>
        </View>

        <CastHistory casts={casts} />

        {reading && completedLines ? (
          <View style={styles.results}>
            {question.trim().length > 0 ? <Text style={styles.questionEcho}>所问：{question.trim()}</Text> : null}
            <HexagramCard title="本卦" hexagram={reading.primary} lines={completedLines} showLines />
            <View style={styles.changesPanel}>
              <Text style={styles.panelLabel}>变爻</Text>
              {reading.changingLines.length > 0 ? (
                reading.changingLines.map(({ line, position }) => (
                  <Text key={position} style={styles.changeText}>
                    第{position}爻：{yaoLabel(line)}
                  </Text>
                ))
              ) : (
                <Text style={styles.changeText}>无变爻。此卦以本卦为主，表示局面较为稳定，宜细看本卦之意。</Text>
              )}
            </View>
            <HexagramCard title="之卦" hexagram={reading.relating} />
            <View style={styles.nextPanel}>
              <Text style={styles.nextTitle}>卦象已成</Text>
              <Text style={styles.nextCopy}>进入新页面，本卦、变爻与之卦生成完整解读。</Text>
              <Pressable
                style={({ pressed }) => [styles.geminiButton, pressed && styles.buttonPressed]}
                onPress={() => setPage("gemini")}
              >
                <Text style={styles.geminiButtonText}>进入解卦页</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  languageRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 12
},
languageButton: {
  flex: 1,
  height: 42,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#8c6d3b",
  alignItems: "center",
  justifyContent: "center"
},
languageButtonActive: {
  backgroundColor: "#2f5d50",
  borderColor: "#2f5d50"
},
languageButtonText: {
  color: "#211a14",
  fontSize: 15,
  fontWeight: "800"
},
safeArea: {
    flex: 1,
    backgroundColor: "#17130f"
  },
  content: {
    padding: 20,
    paddingBottom: 36
  },
  answerContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 96
  },
  header: {
    paddingTop: 20,
    paddingBottom: 18
  },
  pageHeader: {
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12
  },
  appName: {
    color: "#f6e7c8",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0
  },
  headline: {
    color: "#fff9ec",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 14
  },
  pageHeadline: {
    color: "#fff9ec",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: 0
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#594832",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  backButtonText: {
    color: "#f6e7c8",
    fontSize: 15,
    fontWeight: "800"
  },
  answerNavRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap"
  },
  askPanel: {
    backgroundColor: "#fff8ea",
    borderRadius: 8,
    padding: 16
  },
  inputLabel: {
    color: "#3a3025",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 8
  },
  input: {
    minHeight: 92,
    color: "#211a14",
    backgroundColor: "#eee1ce",
    borderRadius: 6,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 22
  },
  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1
  },
  castButton: {
    flex: 1,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#b72222",
    alignItems: "center",
    justifyContent: "center"
  },
  endButton: {
    height: 52,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#8c6d3b",
    backgroundColor: "#fff8ea",
    alignItems: "center",
    justifyContent: "center"
  },
  buttonPressed: {
    opacity: 0.78
  },
  castButtonText: {
    color: "#fff8ea",
    fontSize: 17,
    fontWeight: "800"
  },
  endButtonText: {
    color: "#3a3025",
    fontSize: 17,
    fontWeight: "800"
  },
  progressPanel: {
    marginTop: 14,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#262019",
    borderWidth: 1,
    borderColor: "#594832"
  },
  progressText: {
    color: "#f6e7c8",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#594832",
    overflow: "hidden"
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#b72222"
  },
  castsPanel: {
    marginTop: 14,
    gap: 10
  },
  castRecord: {
    backgroundColor: "#fff8ea",
    borderRadius: 8,
    padding: 14
  },
  castRecordHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12
  },
  castTitle: {
    color: "#211a14",
    fontSize: 16,
    fontWeight: "800"
  },
  castSummary: {
    color: "#9f332d",
    fontSize: 14,
    fontWeight: "800"
  },
  coinRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 12
  },
  coin: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2
  },
  coinFront: {
    backgroundColor: "#d7a93a",
    borderColor: "#8c6115"
  },
  coinBack: {
    backgroundColor: "#6f7f72",
    borderColor: "#3f4d42"
  },
  coinFace: {
    color: "#17130f",
    fontSize: 18,
    fontWeight: "900"
  },
  coinValue: {
    color: "#17130f",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2
  },
  recordLine: {
    width: 168,
    alignSelf: "center"
  },
  results: {
    gap: 14,
    marginTop: 16
  },
  questionEcho: {
    color: "#f2dfbd",
    fontSize: 14,
    lineHeight: 20
  },
  resultPanel: {
    backgroundColor: "#fff8ea",
    borderRadius: 8,
    padding: 16
  },
  changesPanel: {
    backgroundColor: "#262019",
    borderWidth: 1,
    borderColor: "#594832",
    borderRadius: 8,
    padding: 16
  },
  panelLabel: {
    color: "#9f332d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 10
  },
  hexHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  hexNumber: {
    color: "#8c6d3b",
    fontWeight: "800",
    width: 54,
    fontSize: 12
  },
  hexHanzi: {
    color: "#17130f",
    fontSize: 36,
    fontWeight: "800",
    width: 46,
    textAlign: "center"
  },
  hexTitleWrap: {
    flex: 1
  },
  hexTitle: {
    color: "#211a14",
    fontSize: 20,
    fontWeight: "800"
  },
  hexSubtitle: {
    color: "#75634f",
    fontSize: 13,
    marginTop: 2
  },
  hexLines: {
    marginVertical: 18,
    alignSelf: "center",
    gap: 8,
    width: 168
  },
  lineRow: {
    height: 12,
    justifyContent: "center"
  },
  solidLine: {
    height: 8,
    borderRadius: 2,
    backgroundColor: "#17130f"
  },
  brokenWrap: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  halfLine: {
    width: 70,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#17130f"
  },
  changingLine: {
    backgroundColor: "#b72222"
  },
  counsel: {
    color: "#352b21",
    fontSize: 15,
    lineHeight: 22
  },
  changeText: {
    color: "#fff3df",
    fontSize: 15,
    lineHeight: 23
  },
  geminiPanel: {
    backgroundColor: "#fff8ea",
    borderRadius: 8,
    padding: 16
  },
  answerPanel: {
    backgroundColor: "#fff8ea",
    borderRadius: 8,
    padding: 16,
    marginTop: 14,
    flexGrow: 1
  },
  geminiSummaryGrid: {
    gap: 14,
    marginBottom: 14
  },
  nextPanel: {
    backgroundColor: "#fff8ea",
    borderRadius: 8,
    padding: 16
  },
  nextTitle: {
    color: "#211a14",
    fontSize: 20,
    fontWeight: "800"
  },
  nextCopy: {
    color: "#75634f",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  geminiHint: {
    color: "#75634f",
    fontSize: 14,
    lineHeight: 21
  },
  geminiButton: {
    marginTop: 12,
    height: 50,
    borderRadius: 6,
    backgroundColor: "#2f5d50",
    alignItems: "center",
    justifyContent: "center"
  },
  disabledButton: {
    opacity: 0.62
  },
  geminiButtonText: {
    color: "#fff8ea",
    fontSize: 16,
    fontWeight: "800"
  },
  secondaryFullButton: {
    marginTop: 10,
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#8c6d3b",
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryFullButtonText: {
    color: "#3a3025",
    fontSize: 16,
    fontWeight: "800"
  },
  geminiError: {
    color: "#b72222",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    fontWeight: "700"
  },
  geminiAnswer: {
    color: "#352b21",
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14
  },
  answerParagraph: {
    color: "#352b21",
    fontSize: 16,
    lineHeight: 27,
    marginTop: 14
  },
  answerWarning: {
    color: "#b72222",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
    marginTop: 8
  },
  emptyPanel: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#594832"
  },
  emptyTitle: {
    color: "#f6e7c8",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8
  },
  emptyCopy: {
    color: "#cbb996",
    fontSize: 15,
    lineHeight: 23
  }
});
