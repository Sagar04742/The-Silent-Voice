// ---------------------------------------------------------------------------
// Two-hand combinations (Everyday mode). Show one sign with each hand at the same
// time. Order does not matter ("help"+"water" == "water"+"help").
// Curated pairs read naturally; any other pair falls back to both signs' sentences
// joined, so every combination of two signs still says something sensible.
// ---------------------------------------------------------------------------
import { findGesture } from "./gestures";

const C = (a, b, en, hi, bn, ta) => ({ key: [a, b].sort().join("+"), a, b, text: { en, hi, bn, ta } });

export const COMBOS = [
  // same sign on both hands = emphasis
  C("hello", "hello", "Hello, everyone!", "सभी को नमस्ते!", "সবাইকে নমস্কার!", "அனைவருக்கும் வணக்கம்!"),
  C("yes", "yes", "Yes, absolutely.", "हाँ, बिल्कुल।", "হ্যাঁ, অবশ্যই।", "ஆம், நிச்சயமாக."),
  C("no", "no", "No, definitely not.", "नहीं, बिल्कुल नहीं।", "না, একদমই না।", "இல்லை, கண்டிப்பாக இல்லை."),
  C("fine", "fine", "Everything is fine.", "सब ठीक है।", "সব ঠিক আছে।", "எல்லாம் நலம்."),
  C("thanks", "thanks", "Thank you so much.", "आपका बहुत-बहुत धन्यवाद।", "অসংখ্য ধন্যবাদ।", "மிக்க நன்றி."),
  C("love", "love", "I love you very much.", "मुझे आपसे बहुत ज़्यादा प्यार है।", "আমি তোমাকে অনেক ভালোবাসি।", "நான் உன்னை மிகவும் நேசிக்கிறேன்."),
  C("wait", "wait", "Please stop and wait.", "कृपया रुकिए और प्रतीक्षा कीजिए।", "দয়া করে থামুন এবং অপেক্ষা করুন।", "தயவுசெய்து நிறுத்திக் காத்திருங்கள்."),
  C("help", "help", "I need help urgently.", "मुझे तुरंत मदद चाहिए।", "আমার এখনই সাহায্য দরকার।", "எனக்கு உடனடியாக உதவி தேவை."),
  C("water", "water", "I am very thirsty. Please give me water.", "मुझे बहुत प्यास लगी है। कृपया पानी दीजिए।", "আমার খুব তেষ্টা পেয়েছে। দয়া করে জল দিন।", "எனக்கு மிகவும் தாகமாக இருக்கிறது. தயவுசெய்து தண்ணீர் தாருங்கள்."),
  C("food", "food", "I am very hungry.", "मुझे बहुत भूख लगी है।", "আমার খুব খিদে পেয়েছে।", "எனக்கு மிகவும் பசிக்கிறது."),
  C("sorry", "sorry", "I am really sorry.", "मुझे सच में खेद है।", "আমি সত্যিই দুঃখিত।", "நான் உண்மையிலேயே வருந்துகிறேன்."),
  C("please", "please", "Please, I request you.", "कृपया, मेरा निवेदन है।", "দয়া করে, আমার অনুরোধ।", "தயவுசெய்து, இது என் வேண்டுகோள்."),
  C("doctor", "doctor", "I need a doctor urgently.", "मुझे तुरंत डॉक्टर चाहिए।", "আমার এখনই ডাক্তার দরকার।", "எனக்கு உடனடியாக மருத்துவர் தேவை."),
  // asking for help with something
  C("help", "water", "Please help me, I need water.", "कृपया मेरी मदद कीजिए, मुझे पानी चाहिए।", "দয়া করে সাহায্য করুন, আমার জল দরকার।", "தயவுசெய்து உதவுங்கள், எனக்குத் தண்ணீர் வேண்டும்."),
  C("help", "food", "Please help me, I need food.", "कृपया मेरी मदद कीजिए, मुझे खाना चाहिए।", "দয়া করে সাহায্য করুন, আমার খাবার দরকার।", "தயவுசெய்து உதவுங்கள், எனக்கு உணவு வேண்டும்."),
  C("help", "doctor", "Please help me find a doctor.", "कृपया डॉक्टर ढूँढने में मेरी मदद कीजिए।", "ডাক্তার খুঁজতে দয়া করে আমাকে সাহায্য করুন।", "மருத்துவரைக் கண்டுபிடிக்க உதவுங்கள்."),
  C("help", "washroom", "Please help me find the washroom.", "कृपया शौचालय ढूँढने में मेरी मदद कीजिए।", "শৌচালয় খুঁজতে দয়া করে আমাকে সাহায্য করুন।", "கழிவறையைக் கண்டுபிடிக்க உதவுங்கள்."),
  C("help", "call", "Please help me call my family.", "कृपया मेरे परिवार को फ़ोन करने में मेरी मदद कीजिए।", "আমার পরিবারকে ফোন করতে দয়া করে সাহায্য করুন।", "என் குடும்பத்தினரை அழைக்க உதவுங்கள்."),
  C("call", "doctor", "Please call my doctor.", "कृपया मेरे डॉक्टर को फ़ोन कीजिए।", "দয়া করে আমার ডাক্তারকে ফোন করুন।", "தயவுசெய்து என் மருத்துவரை அழையுங்கள்."),
  // polite requests
  C("please", "water", "Water, please.", "कृपया पानी दीजिए।", "দয়া করে জল দিন।", "தயவுசெய்து தண்ணீர் தாருங்கள்."),
  C("food", "please", "Food, please.", "कृपया खाना दीजिए।", "দয়া করে খাবার দিন।", "தயவுசெய்து உணவு தாருங்கள்."),
  C("please", "wait", "Please wait for me.", "कृपया मेरी प्रतीक्षा कीजिए।", "দয়া করে আমার জন্য অপেক্ষা করুন।", "தயவுசெய்து எனக்காகக் காத்திருங்கள்."),
  C("sorry", "wait", "Sorry, please wait a little.", "माफ़ कीजिए, थोड़ी देर रुकिए।", "দুঃখিত, একটু অপেক্ষা করুন।", "மன்னிக்கவும், சிறிது காத்திருங்கள்."),
  // answers
  C("thanks", "yes", "Yes, thank you.", "हाँ, धन्यवाद।", "হ্যাঁ, ধন্যবাদ।", "ஆம், நன்றி."),
  C("no", "thanks", "No, thank you.", "नहीं, धन्यवाद।", "না, ধন্যবাদ।", "இல்லை, நன்றி."),
  C("fine", "yes", "Yes, I am fine.", "हाँ, मैं ठीक हूँ।", "হ্যাঁ, আমি ভালো আছি।", "ஆம், நான் நலமாக இருக்கிறேன்."),
  C("fine", "no", "No, I am not fine.", "नहीं, मैं ठीक नहीं हूँ।", "না, আমি ভালো নেই।", "இல்லை, நான் நலமாக இல்லை."),
  C("help", "no", "No, I do not need help.", "नहीं, मुझे मदद नहीं चाहिए।", "না, আমার সাহায্য দরকার নেই।", "இல்லை, எனக்கு உதவி தேவையில்லை."),
  C("help", "yes", "Yes, I need help.", "हाँ, मुझे मदद चाहिए।", "হ্যাঁ, আমার সাহায্য দরকার।", "ஆம், எனக்கு உதவி தேவை."),
  C("doctor", "yes", "Yes, I need a doctor.", "हाँ, मुझे डॉक्टर चाहिए।", "হ্যাঁ, আমার ডাক্তার দরকার।", "ஆம், எனக்கு மருத்துவர் தேவை."),
  C("water", "yes", "Yes, I would like some water.", "हाँ, मुझे पानी चाहिए।", "হ্যাঁ, আমার জল চাই।", "ஆம், எனக்குத் தண்ணீர் வேண்டும்."),
  C("food", "yes", "Yes, I would like some food.", "हाँ, मुझे खाना चाहिए।", "হ্যাঁ, আমার খাবার চাই।", "ஆம், எனக்கு உணவு வேண்டும்."),
  C("food", "no", "No, I do not want food.", "नहीं, मुझे खाना नहीं चाहिए।", "না, আমার খাবার চাই না।", "இல்லை, எனக்கு உணவு வேண்டாம்."),
  C("no", "water", "No, I do not want water.", "नहीं, मुझे पानी नहीं चाहिए।", "না, আমার জল চাই না।", "இல்லை, எனக்குத் தண்ணீர் வேண்டாம்."),
  // greetings
  C("fine", "hello", "Hello, I am fine.", "नमस्ते, मैं ठीक हूँ।", "নমস্কার, আমি ভালো আছি।", "வணக்கம், நான் நலமாக இருக்கிறேன்."),
  C("hello", "help", "Hello, I need help.", "नमस्ते, मुझे मदद चाहिए।", "নমস্কার, আমার সাহায্য দরকার।", "வணக்கம், எனக்கு உதவி தேவை."),
  C("hello", "thanks", "Hello, and thank you.", "नमस्ते, और धन्यवाद।", "নমস্কার, আর ধন্যবাদ।", "வணக்கம், நன்றி."),
  C("love", "thanks", "Thank you, I love you.", "धन्यवाद, मुझे आपसे प्यार है।", "ধন্যবাদ, আমি তোমাকে ভালোবাসি।", "நன்றி, நான் உன்னை நேசிக்கிறேன்."),
];

export const pairKey = (a, b) => [a, b].sort().join("+");

/** Phrase object ({ id, label, text }) for a pair of sign ids. Always resolves. */
export function resolvePair(a, b) {
  const key = pairKey(a, b);
  const combo = COMBOS.find((c) => c.key === key);
  const ga = findGesture(a);
  const gb = findGesture(b);
  const text = {};
  const label = {};
  for (const l of ["en", "hi", "bn", "ta"]) {
    label[l] = `${ga.label[l]} + ${gb.label[l]}`;
    text[l] = combo ? combo.text[l] : a === b ? ga.text[l] : `${ga.text[l]} ${gb.text[l]}`;
  }
  return { id: `pair:${key}`, label, text };
}

// Resolves history ids like "pair:help+water".
export function findPair(id) {
  if (!id?.startsWith("pair:")) return null;
  const [a, b] = id.slice(5).split("+");
  return findGesture(a) && findGesture(b) ? resolvePair(a, b) : null;
}
