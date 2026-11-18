// ---------------------------------------------------------------------------
// Sign vocabulary. Every sign has a stable `id`, a finger `pattern`
// ([thumb, index, middle, ring, pinky], 1 = extended) shown in the guide,
// and a sentence + short label in every supported language.
// Adding a sign = add an entry here + a rule in lib/classifier.js.
// ---------------------------------------------------------------------------

export const LANGUAGES = [
  { code: "en", name: "English", native: "English", speech: ["en-IN", "en-US", "en-GB", "en"] },
  { code: "hi", name: "Hindi", native: "हिन्दी", speech: ["hi-IN", "hi"] },
  { code: "bn", name: "Bengali", native: "বাংলা", speech: ["bn-IN", "bn-BD", "bn"] },
  // Tamil: huge speaker base across South India and good TTS support on Android/Windows/Chrome.
  { code: "ta", name: "Tamil", native: "தமிழ்", speech: ["ta-IN", "ta"] },
];

export const GESTURES = [
  {
    id: "hello", emoji: "✋", pattern: [1, 1, 1, 1, 1], how: "Open palm, fingers apart",
    label: { en: "Hello", hi: "नमस्ते", bn: "নমস্কার", ta: "வணக்கம்" },
    text: { en: "Hello!", hi: "नमस्ते!", bn: "নমস্কার!", ta: "வணக்கம்!" },
  },
  {
    id: "yes", emoji: "✊", pattern: [0, 0, 0, 0, 0], how: "Closed fist",
    label: { en: "Yes", hi: "हाँ", bn: "হ্যাঁ", ta: "ஆம்" },
    text: { en: "Yes.", hi: "हाँ।", bn: "হ্যাঁ।", ta: "ஆம்." },
  },
  {
    id: "no", emoji: "👎", pattern: [1, 0, 0, 0, 0], variant: "down", how: "Thumb pointing down",
    label: { en: "No", hi: "नहीं", bn: "না", ta: "இல்லை" },
    text: { en: "No.", hi: "नहीं।", bn: "না।", ta: "இல்லை." },
  },
  {
    id: "fine", emoji: "👍", pattern: [1, 0, 0, 0, 0], how: "Thumb pointing up",
    label: { en: "I am fine", hi: "मैं ठीक हूँ", bn: "আমি ভালো", ta: "நலம்" },
    text: {
      en: "I am fine, thank you.", hi: "मैं ठीक हूँ, धन्यवाद।",
      bn: "আমি ভালো আছি, ধন্যবাদ।", ta: "நான் நலமாக இருக்கிறேன், நன்றி.",
    },
  },
  {
    id: "water", emoji: "☝️", pattern: [0, 1, 0, 0, 0], how: "Index finger up",
    label: { en: "Water", hi: "पानी", bn: "জল", ta: "தண்ணீர்" },
    text: {
      en: "I need some water, please.", hi: "कृपया मुझे थोड़ा पानी चाहिए।",
      bn: "দয়া করে আমাকে একটু জল দিন।", ta: "எனக்கு கொஞ்சம் தண்ணீர் வேண்டும்.",
    },
  },
  {
    id: "food", emoji: "✌️", pattern: [0, 1, 1, 0, 0], how: "Index and middle up (peace)",
    label: { en: "Food", hi: "खाना", bn: "খাবার", ta: "உணவு" },
    text: {
      en: "I am hungry. May I have some food?", hi: "मुझे भूख लगी है। कृपया खाना दीजिए।",
      bn: "আমার খিদে পেয়েছে। দয়া করে খাবার দিন।", ta: "எனக்குப் பசிக்கிறது. உணவு தாருங்கள்.",
    },
  },
  {
    id: "washroom", emoji: "🖖", pattern: [0, 1, 1, 1, 0], how: "Three fingers up, thumb and pinky tucked",
    label: { en: "Washroom", hi: "शौचालय", bn: "শৌচালয়", ta: "கழிவறை" },
    text: {
      en: "Where is the washroom?", hi: "शौचालय कहाँ है?",
      bn: "শৌচালয় কোথায়?", ta: "கழிவறை எங்கே இருக்கிறது?",
    },
  },
  {
    id: "wait", emoji: "🤚", pattern: [0, 1, 1, 1, 1], how: "Four fingers up, thumb tucked",
    label: { en: "Wait", hi: "रुकिए", bn: "অপেক্ষা", ta: "காத்திருங்கள்" },
    text: {
      en: "Please wait a moment.", hi: "कृपया थोड़ी देर रुकिए।",
      bn: "দয়া করে একটু অপেক্ষা করুন।", ta: "தயவுசெய்து சிறிது காத்திருங்கள்.",
    },
  },
  {
    id: "thanks", emoji: "👌", pattern: [1, 1, 1, 1, 1], how: "Thumb and index touch, others up (OK)",
    label: { en: "Thank you", hi: "धन्यवाद", bn: "ধন্যবাদ", ta: "நன்றி" },
    text: { en: "Thank you.", hi: "धन्यवाद।", bn: "ধন্যবাদ।", ta: "நன்றி." },
  },
  {
    id: "love", emoji: "🤟", pattern: [1, 1, 0, 0, 1], how: "Thumb, index and pinky out",
    label: { en: "I love you", hi: "प्यार", bn: "ভালোবাসা", ta: "அன்பு" },
    text: {
      en: "I love you.", hi: "मुझे आपसे बहुत प्यार है।",
      bn: "আমি তোমাকে ভালোবাসি।", ta: "நான் உன்னை நேசிக்கிறேன்.",
    },
  },
  {
    id: "doctor", emoji: "🤘", pattern: [0, 1, 0, 0, 1], how: "Index and pinky up (horns)",
    label: { en: "Doctor", hi: "डॉक्टर", bn: "ডাক্তার", ta: "மருத்துவர்" },
    text: {
      en: "Please call a doctor.", hi: "कृपया डॉक्टर को बुलाइए।",
      bn: "দয়া করে একজন ডাক্তার ডাকুন।", ta: "தயவுசெய்து ஒரு மருத்துவரை அழையுங்கள்.",
    },
  },
  {
    id: "call", emoji: "🤙", pattern: [1, 0, 0, 0, 1], how: "Thumb and pinky out (phone)",
    label: { en: "Call family", hi: "परिवार को फ़ोन", bn: "পরিবারকে ফোন", ta: "குடும்பத்தை அழை" },
    text: {
      en: "Please call my family.", hi: "कृपया मेरे परिवार को फ़ोन कीजिए।",
      bn: "দয়া করে আমার পরিবারকে ফোন করুন।", ta: "தயவுசெய்து என் குடும்பத்தினரை அழையுங்கள்.",
    },
  },
  {
    id: "help", emoji: "👆", pattern: [1, 1, 0, 0, 0], how: "Thumb and index out (L shape)",
    label: { en: "Help", hi: "मदद", bn: "সাহায্য", ta: "உதவி" },
    text: {
      en: "I need help.", hi: "मुझे मदद चाहिए।",
      bn: "আমার সাহায্য দরকার।", ta: "எனக்கு உதவி தேவை.",
    },
  },
  {
    id: "sorry", emoji: "🙏", pattern: [0, 0, 0, 0, 1], how: "Pinky finger up",
    label: { en: "Sorry", hi: "माफ़ कीजिए", bn: "দুঃখিত", ta: "மன்னிக்கவும்" },
    text: { en: "I am sorry.", hi: "मुझे माफ़ कीजिए।", bn: "আমি দুঃখিত।", ta: "மன்னிக்கவும்." },
  },
  {
    id: "please", emoji: "🤲", pattern: [1, 1, 1, 1, 0], how: "Four fingers and thumb out, pinky tucked",
    label: { en: "Please", hi: "कृपया", bn: "দয়া করে", ta: "தயவுசெய்து" },
    text: { en: "Please.", hi: "कृपया।", bn: "দয়া করে।", ta: "தயவுசெய்து." },
  },
  {
    id: "emergency", emoji: "🚨", pattern: [1, 1, 1, 0, 0], how: "Thumb, index and middle out. Hold longer.",
    emergency: true,
    label: { en: "EMERGENCY", hi: "आपातकाल", bn: "জরুরি", ta: "அவசரம்" },
    text: {
      en: "Emergency! Please help me!", hi: "आपातकाल! कृपया मेरी मदद कीजिए!",
      bn: "জরুরি অবস্থা! দয়া করে আমাকে সাহায্য করুন!", ta: "அவசரம்! தயவுசெய்து எனக்கு உதவுங்கள்!",
    },
  },
];
export const findGesture = (id) => GESTURES.find((g) => g.id === id);
