// ---------------------------------------------------------------------------
// Predefined messages (no sign needed) + a sentence builder.
//
// 1. CATEGORIES: ready-made phrases grouped by situation.
// 2. BUILDER:    templates x items = many sentences from a handful of words,
//                e.g. "I need" + "water" -> "मुझे पानी चाहिए।"
//    Grammar is handled per language in each template, nouns are uninflected
//    so every combination reads naturally.
// ---------------------------------------------------------------------------
import { GESTURES } from "./gestures";
import { findPair } from "./combos";

const P = (id, en, hi, bn, ta) => ({ id, label: { en, hi, bn, ta }, text: { en, hi, bn, ta } });

export const CATEGORIES = [
  {
    id: "essentials",
    name: { en: "Essentials", hi: "ज़रूरी", bn: "প্রয়োজনীয়", ta: "அத்தியாவசியம்" },
    phrases: [
      P("intro", "Hello! I am deaf and unable to speak. This app speaks for me.",
        "नमस्ते! सुनने और बोलने में मुझे कठिनाई है। यह ऐप मेरी ओर से बोल रहा है।",
        "নমস্কার! আমি শুনতে ও বলতে পারি না। এই অ্যাপটি আমার হয়ে কথা বলছে।",
        "வணக்கம்! எனக்குக் காது கேட்காது, பேசவும் இயலாது. இந்த செயலி எனக்காகப் பேசுகிறது."),
      P("slow", "Please speak slowly or write it down.", "कृपया धीरे बोलिए या लिखकर बताइए।",
        "দয়া করে আস্তে বলুন বা লিখে দিন।", "தயவுசெய்து மெதுவாகப் பேசுங்கள் அல்லது எழுதிக் காட்டுங்கள்."),
      P("repeat", "Could you please repeat that?", "क्या आप दोबारा कह सकते हैं?",
        "আপনি কি আবার বলতে পারবেন?", "தயவுசெய்து மீண்டும் சொல்ல முடியுமா?"),
      P("understand", "I do not understand.", "मुझे समझ नहीं आया।", "আমি বুঝতে পারিনি।", "எனக்குப் புரியவில்லை."),
      P("write", "Please write it down for me.", "कृपया मेरे लिए लिखकर दीजिए।",
        "দয়া করে আমার জন্য লিখে দিন।", "தயவுசெய்து எனக்காக எழுதிக் கொடுங்கள்."),
      P("phone", "Please show me on your phone.", "कृपया अपने फ़ोन पर दिखाइए।",
        "দয়া করে আপনার ফোনে দেখান।", "தயவுசெய்து உங்கள் தொலைபேசியில் காட்டுங்கள்."),
      P("excuse", "Excuse me.", "सुनिए, माफ़ कीजिए।", "মাফ করবেন।", "சற்று வழி விடுங்கள்."),
      P("thankyoumuch", "Thank you very much.", "आपका बहुत धन्यवाद।", "আপনাকে অনেক ধন্যবাদ।", "மிக்க நன்றி."),
    ],
  },
  {
    id: "health",
    name: { en: "Health", hi: "स्वास्थ्य", bn: "স্বাস্থ্য", ta: "உடல்நலம்" },
    phrases: [
      P("notwell", "I am not feeling well.", "मेरी तबीयत ठीक नहीं है।", "আমার শরীর ভালো নেই।", "எனக்கு உடல்நிலை சரியில்லை."),
      P("headache", "I have a headache.", "मेरे सिर में दर्द है।", "আমার মাথা ব্যথা করছে।", "எனக்குத் தலைவலி."),
      P("stomach", "I have a stomach ache.", "मेरे पेट में दर्द है।", "আমার পেট ব্যথা করছে।", "எனக்கு வயிற்று வலி."),
      P("fever", "I have a fever.", "मुझे बुखार है।", "আমার জ্বর হয়েছে।", "எனக்குக் காய்ச்சல் இருக்கிறது."),
      P("dizzy", "I feel dizzy.", "मुझे चक्कर आ रहे हैं।", "আমার মাথা ঘুরছে।", "எனக்குத் தலை சுற்றுகிறது."),
      P("medicine", "I need my medicine.", "मुझे मेरी दवा चाहिए।", "আমার ওষুধ দরকার।", "எனக்கு என் மருந்து வேண்டும்."),
      P("allergy", "I am allergic to this.", "मुझे इससे एलर्जी है।", "আমার এতে অ্যালার্জি আছে।", "எனக்கு இதனால் ஒவ்வாமை ஏற்படும்."),
      P("ambulance", "Please call an ambulance.", "कृपया एम्बुलेंस बुलाइए।", "দয়া করে অ্যাম্বুলেন্স ডাকুন।", "தயவுசெய்து ஆம்புலன்ஸை அழையுங்கள்."),
    ],
  },
  {
    id: "travel",
    name: { en: "Travel", hi: "यात्रा", bn: "ভ্রমণ", ta: "பயணம்" },
    phrases: [
      P("address", "Please take me to this address.", "कृपया मुझे इस पते पर ले चलिए।",
        "দয়া করে আমাকে এই ঠিকানায় নিয়ে চলুন।", "தயவுசெய்து என்னை இந்த முகவரிக்கு அழைத்துச் செல்லுங்கள்."),
      P("whichbus", "Which bus goes to this place?", "इस जगह के लिए कौन सी बस जाती है?",
        "এই জায়গায় কোন বাস যায়?", "இந்த இடத்திற்கு எந்தப் பேருந்து செல்கிறது?"),
      P("station", "Where is the nearest railway station?", "सबसे नज़दीकी रेलवे स्टेशन कहाँ है?",
        "সবচেয়ে কাছের রেলস্টেশন কোথায়?", "அருகிலுள்ள ரயில் நிலையம் எங்கே?"),
      P("stophere", "Please stop here.", "कृपया यहाँ रोकिए।", "দয়া করে এখানে থামুন।", "தயவுசெய்து இங்கே நிறுத்துங்கள்."),
      P("meter", "Please use the meter.", "कृपया मीटर से चलिए।", "দয়া করে মিটারে চলুন।", "தயவுசெய்து மீட்டர் போடுங்கள்."),
      P("lost", "I am lost. Can you help me?", "मुझे रास्ता नहीं मिल रहा। क्या आप मदद करेंगे?",
        "আমি পথ হারিয়ে ফেলেছি। আপনি কি সাহায্য করবেন?", "நான் வழி தவறிவிட்டேன். உதவ முடியுமா?"),
      P("leaves", "What time does it leave?", "यह कितने बजे चलेगी?", "এটা ক'টায় ছাড়বে?", "இது எத்தனை மணிக்குப் புறப்படும்?"),
    ],
  },
  {
    id: "shopping",
    name: { en: "Shopping", hi: "खरीदारी", bn: "কেনাকাটা", ta: "வாங்குதல்" },
    phrases: [
      P("price", "How much does this cost?", "यह कितने का है?", "এটার দাম কত?", "இதன் விலை என்ன?"),
      P("expensive", "That is too expensive.", "यह बहुत महँगा है।", "এটা অনেক দামি।", "இது மிகவும் விலை அதிகம்."),
      P("discount", "Can you give a small discount?", "क्या आप थोड़ी छूट दे सकते हैं?",
        "আপনি কি একটু ছাড় দিতে পারবেন?", "கொஞ்சம் தள்ளுபடி தர முடியுமா?"),
      P("takethis", "I would like this one.", "मुझे यह वाला चाहिए।", "আমি এটা নেব।", "எனக்கு இது வேண்டும்."),
      P("upi", "Do you accept UPI?", "क्या आप यूपीआई लेते हैं?", "আপনি কি ইউপিআই নেন?", "நீங்கள் யுபிஐ ஏற்கிறீர்களா?"),
      P("bill", "Please give me a bill.", "कृपया बिल दीजिए।", "দয়া করে বিল দিন।", "தயவுசெய்து பில் கொடுங்கள்."),
    ],
  },
  {
    id: "daily",
    name: { en: "Daily life", hi: "रोज़मर्रा", bn: "দৈনন্দিন", ta: "அன்றாடம்" },
    phrases: [
      P("goodmorning", "Good morning.", "सुप्रभात।", "শুভ সকাল।", "காலை வணக்கம்."),
      P("howareyou", "How are you?", "आप कैसे हैं?", "আপনি কেমন আছেন?", "நீங்கள் எப்படி இருக்கிறீர்கள்?"),
      P("nicetomeet", "Nice to meet you.", "आपसे मिलकर अच्छा लगा।", "আপনার সঙ্গে দেখা হয়ে ভালো লাগল।", "உங்களைச் சந்தித்ததில் மகிழ்ச்சி."),
      P("hungry", "I am hungry.", "मुझे भूख लगी है।", "আমার খিদে পেয়েছে।", "எனக்குப் பசிக்கிறது."),
      P("thirsty", "I am thirsty.", "मुझे प्यास लगी है।", "আমার তেষ্টা পেয়েছে।", "எனக்குத் தாகமாக இருக்கிறது."),
      P("tired", "I am tired.", "मुझे थकान हो रही है।", "আমার ক্লান্তি লাগছে।", "எனக்குச் சோர்வாக இருக்கிறது."),
      P("goodnight", "Good night.", "शुभ रात्रि।", "শুভ রাত্রি।", "இனிய இரவு வணக்கம்."),
    ],
  },
];

// ---- Sentence builder -------------------------------------------------------
// kind: thing | place | person. Templates only accept sensible kinds.
const I = (id, kind, en, enThe, hi, bn, ta) => ({ id, kind, en, enThe, hi, bn, ta });

export const BUILDER = {
  templates: [
    {
      id: "need", kinds: ["thing", "person"],
      label: { en: "I need…", hi: "मुझे चाहिए…", bn: "আমার দরকার…", ta: "எனக்கு வேண்டும்…" },
      en: (x) => `I need ${x.en}.`,
      hi: (x) => `मुझे ${x.hi} चाहिए।`,
      bn: (x) => `আমার ${x.bn} দরকার।`,
      ta: (x) => `எனக்கு ${x.ta} வேண்டும்.`,
    },
    {
      id: "where", kinds: ["thing", "place"],
      label: { en: "Where is…", hi: "कहाँ है…", bn: "কোথায়…", ta: "எங்கே…" },
      en: (x) => `Where is ${x.enThe}?`,
      hi: (x) => `${x.hi} कहाँ है?`,
      bn: (x) => `${x.bn} কোথায়?`,
      ta: (x) => `${x.ta} எங்கே?`,
    },
    {
      id: "have", kinds: ["thing"],
      label: { en: "Do you have…", hi: "क्या आपके पास…", bn: "আপনার কাছে কি…", ta: "உங்களிடம்…" },
      en: (x) => `Do you have ${x.en}?`,
      hi: (x) => `क्या आपके पास ${x.hi} है?`,
      bn: (x) => `আপনার কাছে কি ${x.bn} আছে?`,
      ta: (x) => `உங்களிடம் ${x.ta} இருக்கிறதா?`,
    },
  ],
  items: [
    I("water", "thing", "some water", "the water", "पानी", "জল", "தண்ணீர்"),
    I("food", "thing", "food", "the food", "खाना", "খাবার", "உணவு"),
    I("medicine", "thing", "medicine", "the medicine", "दवा", "ওষুধ", "மருந்து"),
    I("phone", "thing", "a phone", "my phone", "फ़ोन", "ফোন", "தொலைபேசி"),
    I("charger", "thing", "a phone charger", "the charger", "चार्जर", "চার্জার", "சார்ஜர்"),
    I("pen", "thing", "a pen and paper", "the pen and paper", "कलम और कागज़", "কলম ও কাগজ", "பேனா மற்றும் காகிதம்"),
    I("doctor", "person", "a doctor", "the doctor", "डॉक्टर", "ডাক্তার", "மருத்துவர்"),
    I("help", "person", "help", "help", "मदद", "সাহায্য", "உதவி"),
    I("police", "person", "the police", "the police", "पुलिस", "পুলিশ", "காவல்துறை"),
    I("washroom", "place", "the washroom", "the washroom", "शौचालय", "শৌচালয়", "கழிவறை"),
    I("hospital", "place", "a hospital", "the hospital", "अस्पताल", "হাসপাতাল", "மருத்துவமனை"),
    I("pharmacy", "place", "a pharmacy", "the pharmacy", "दवा की दुकान", "ওষুধের দোকান", "மருந்துக் கடை"),
    I("atm", "place", "an ATM", "the ATM", "एटीएम", "এটিএম", "ஏடிஎம்"),
    I("busstop", "place", "a bus stop", "the bus stop", "बस स्टॉप", "বাস স্টপ", "பேருந்து நிறுத்தம்"),
    I("station", "place", "a railway station", "the railway station", "रेलवे स्टेशन", "রেলস্টেশন", "ரயில் நிலையம்"),
    I("exit", "place", "the exit", "the exit", "बाहर निकलने का रास्ता", "বের হওয়ার পথ", "வெளியேறும் வழி"),
  ],
};

export function buildSentence(templateId, itemId, lang) {
  const tpl = BUILDER.templates.find((t) => t.id === templateId);
  const item = BUILDER.items.find((i) => i.id === itemId);
  if (!tpl || !item) return null;
  return tpl[lang](item);
}

// ---- Lookup used by history / replay ----------------------------------------
// Ids: sign id, phrase id, or "build:<template>:<item>" (rebuilt in any language).
export function findPhrase(id) {
  if (!id) return null;
  if (id.startsWith("pair:")) return findPair(id);
  if (id.startsWith("build:")) {
    const [, tpl, item] = id.split(":");
    const text = {};
    for (const l of ["en", "hi", "bn", "ta"]) text[l] = buildSentence(tpl, item, l);
    if (!text.en) return null;
    return { id, label: text, text };
  }
  const g = GESTURES.find((x) => x.id === id);
  if (g) return g;
  for (const c of CATEGORIES) {
    const p = c.phrases.find((x) => x.id === id);
    if (p) return p;
  }
  return null;
}
