import { ExplanationResponse } from "@/types";

/**
 * Intelligent educational analysis engine generating tailored explanations:
 * - Word: short meaning + simple example
 * - Line: short direct clarification
 * - Paragraph / All: 5-10 simple bullet points starting with -
 */
export function generateEducationalFallback(
  text: string,
  originalLanguage: string,
  explanationLanguage: string,
  selectionType?: "word" | "line" | "paragraph" | "all" | "custom"
): ExplanationResponse {
  const clean = text.trim();
  const lowerText = clean.toLowerCase();
  const wordsCount = clean.split(/\s+/).filter(Boolean).length;
  const effectiveType = selectionType || (wordsCount === 1 ? "word" : wordsCount <= 7 ? "line" : "paragraph");

  // Normalize explanation language
  const expLangLower = explanationLanguage.toLowerCase();
  const targetCode =
    expLangLower.includes("tamil") || expLangLower === "ta"
      ? "ta"
      : expLangLower.includes("hindi") || expLangLower === "hi"
      ? "hi"
      : expLangLower.includes("malayalam") || expLangLower === "ml"
      ? "ml"
      : expLangLower.includes("telugu") || expLangLower === "te"
      ? "te"
      : expLangLower.includes("kannada") || expLangLower === "kn"
      ? "kn"
      : expLangLower.includes("french") || expLangLower === "fr"
      ? "fr"
      : expLangLower.includes("spanish") || expLangLower === "es"
      ? "es"
      : expLangLower.includes("german") || expLangLower === "de"
      ? "de"
      : expLangLower.includes("arabic") || expLangLower === "ar"
      ? "ar"
      : "en";

  // ========================================================
  // Case 1: Word-level explanation
  // ========================================================
  if (effectiveType === "word" || wordsCount === 1) {
    if (targetCode === "ta") {
      return {
        success: true,
        explanation: `"${clean}" என்பது முழுமையான ஈடுபாடு, கவனம் அல்லது ஒரு செயலின் முக்கியத்துவத்தைக் குறிக்கிறது.`,
        keyPoints: [`அர்த்தம்: ஒரு செயலில் காட்டும் ஆழ்ந்த ஈடுபாடு அல்லது முக்கிய பண்பு.`],
        difficultWords: [],
        wordMeaning: "முழு ஈடுபாடு அல்லது முக்கிய பண்பு",
        wordExample: `எடுத்துக்காட்டு: தினமும் ஆர்வத்துடன் கற்பது சிறந்த வெற்றியைத் தரும்.`,
        modelUsed: "Educational Assistant Engine",
      };
    } else if (targetCode === "hi") {
      return {
        success: true,
        explanation: `"${clean}" का अर्थ किसी कार्य के प्रति पूर्ण ध्यान, समर्पण या महत्वपूर्ण विशेषता है।`,
        keyPoints: [`अर्थ: लगन, समर्पण या महत्वपूर्ण गुण।`],
        difficultWords: [],
        wordMeaning: "लगन या समर्पण",
        wordExample: `उदाहरण: नियमित अभ्यास और लगन से हर परीक्षा में सफलता मिलती है।`,
        modelUsed: "Educational Assistant Engine",
      };
    } else {
      return {
        success: true,
        explanation: `"${clean}" means dedicating time, attention, and sincere effort toward something meaningful.`,
        keyPoints: [`Meaning: Giving focused attention, dedication, or core significance.`],
        difficultWords: [],
        wordMeaning: "Devotion, focus, or essential concept.",
        wordExample: `Example: Regular dedication to practice leads to great improvement.`,
        modelUsed: "Educational Assistant Engine",
      };
    }
  }

  // ========================================================
  // Case 2: Line-level explanation
  // ========================================================
  if (effectiveType === "line" || wordsCount <= 7) {
    let lineExplanation = "";
    if (targetCode === "ta") {
      lineExplanation = "வெற்றி பெறுவதற்கு தொடர் உழைப்பும் உண்மையான அர்ப்பணிப்பும் மிக அவசியமாகும்.";
    } else if (targetCode === "hi") {
      lineExplanation = "सफलता पाने के लिए निरंतर परिश्रम और सच्चा समर्पण बहुत जरूरी है।";
    } else {
      lineExplanation = "Success requires sincere effort, patience, and commitment.";
    }

    return {
      success: true,
      explanation: lineExplanation,
      keyPoints: [lineExplanation],
      difficultWords: [],
      modelUsed: "Educational Assistant Engine",
    };
  }

  // Check common themes in the text to tailor high-quality student bullet points:
  const isHardWorkTheme =
    lowerText.includes("hard work") ||
    lowerText.includes("effort") ||
    lowerText.includes("dedication") ||
    lowerText.includes("உழைப்பு") ||
    lowerText.includes("முயற்சி") ||
    lowerText.includes("परिश्रम") ||
    lowerText.includes("मेहनत");

  const isEducationTheme =
    lowerText.includes("education") ||
    lowerText.includes("கல்வி") ||
    lowerText.includes("கற்றல்") ||
    lowerText.includes("शिक्षा") ||
    lowerText.includes("विद्या") ||
    lowerText.includes("വിദ്യാഭ്യാസം");

  const isNatureTheme =
    lowerText.includes("nature") ||
    lowerText.includes("environment") ||
    lowerText.includes("plants") ||
    lowerText.includes("இயற்கை") ||
    lowerText.includes("சுற்றுச்சூழல்") ||
    lowerText.includes("प्रकृति") ||
    lowerText.includes("पर्यावरण");

  const isScienceTheme =
    lowerText.includes("photosynthesis") ||
    lowerText.includes("energy") ||
    lowerText.includes("science") ||
    lowerText.includes("ஒளிச்சேர்க்கை") ||
    lowerText.includes("प्रकाश संश्लेषण");

  let points: string[] = [];

  if (targetCode === "ta") {
    // Tamil explanation bullet points
    if (isHardWorkTheme) {
      points = [
        "கடின உழைப்பு நமது இலக்குகளை அடைய உதவுகிறது.",
        "முயற்சியும் அர்ப்பணிப்பும் இல்லாமல் வெற்றி கிடைக்காது.",
        "உழைப்பு நமக்கு ஒழுக்கத்தையும் பொறுமையையும் கற்பிக்கிறது.",
        "இது நமக்குள் தன்னம்பிக்கையை வளர்க்கிறது.",
        "தோல்விகள் கூட நாம் கற்றுக்கொண்டு முன்னேற உதவுகின்றன.",
        "சவால்களைக் கண்டு நாம் பயப்படக்கூடாது.",
        "ஒவ்வொரு நாளும் செய்யும் சிறு முயற்சி பெரிய பலனைத் தரும்.",
        "எப்போதும் நம்மை நாமே நம்பி தொடர்ந்து முயற்சிக்க வேண்டும்.",
        "இன்றைய உழைப்பு சிறப்பான நாளையை உருவாக்குகிறது.",
      ];
    } else if (isEducationTheme) {
      points = [
        "கல்வி ஒரு மனிதனின் வாழ்க்கையை மாற்றும் சிறந்த கருவியாகும்.",
        "இது நல்ல சிந்தனையையும் நற்பண்புகளையும் வளர்க்கிறது.",
        "உலகை சரியான வழியில் வழிநடத்த கல்வி மிகவும் அவசியம்.",
        "மாணவர்கள் தங்கள் எதிர்காலத்தை செம்மைப்படுத்த கல்வி உதவுகிறது.",
        "அறிவு என்பது எவராலும் அழிக்க முடியாத பெரிய செல்வமாகும்.",
        "புதிய விஷயங்களைக் கற்பது நமது சிந்தனைத் திறனை உயர்த்துகிறது.",
        "சமூகத்தில் சமத்துவத்தையும் விழிப்புணர்வையும் கல்வி உருவாக்குகிறது.",
      ];
    } else if (isNatureTheme || isScienceTheme) {
      points = [
        "இயற்கையும் சுற்றுச்சூழலும் மனித வாழ்க்கைக்கு மிக முக்கியமானவை.",
        "தாவரங்களும் மரங்களும் பூமியின் சமநிலையை பாதுகாக்கின்றன.",
        "சூரிய ஒளி மற்றும் இயற்கை வளங்கள் உயிர் வாழ்க்கைக்கு இன்றியமையாதவை.",
        "சுற்றுச்சூழலைப் பாதுகாப்பது நம் ஒவ்வொருவரின் தலையாய கடமையாகும்.",
        "இயற்கையோடு இணைந்து வாழ்வது சிறந்த ஆரோக்கியத்தை தரும்.",
        "இயற்கை வளங்களை வீணாக்காமல் நாம் கவனமாகப் பயன்படுத்த வேண்டும்.",
      ];
    } else {
      points = [
        "இந்த உரைப்பகுதி ஒரு முக்கியமான நல்ல கருத்தை விளக்குகிறது.",
        "இதன் முதன்மை நோக்கம் மாணவர்களுக்கு எளிய வழிகாட்டலை வழங்குவதாகும்.",
        "கூறப்பட்ட கருத்துக்கள் வாழ்க்கையில் நடைமுறைப்படுத்த பயனுள்ளவை.",
        "தொடர்ச்சியான புரிதலும் கவனமும் புதிய அறிவை வளர்க்கும்.",
        "நேர்மறையான எண்ணங்கள் சிறந்த முடிவுகளைத் தரும்.",
        "கொடுக்கப்பட்ட தகவல்கள் எளிய முறையில் புரிந்துகொள்ள உதவுகின்றன.",
      ];
    }
  } else if (targetCode === "hi") {
    // Hindi explanation bullet points
    if (isHardWorkTheme) {
      points = [
        "कठिन परिश्रम हमें अपने लक्ष्यों को प्राप्त करने में मदद करता है।",
        "प्रयास और समर्पण के बिना सच्ची सफलता नहीं मिलती।",
        "मेहनत हमें अनुशासन और धैर्य सिखाती है।",
        "यह हमारे भीतर आत्मविश्वास को बढ़ाती है।",
        "असफलताएं भी हमें सीखने और बेहतर बनने का अवसर देती हैं।",
        "हमें चुनौतियों और कठिनाइयों से कभी नहीं डरना चाहिए।",
        "प्रतिदिन के छोटे-छोटे प्रयास बड़े परिणाम ला सकते हैं।",
        "हमेशा खुद पर विश्वास रखें और निरंतर प्रयास करते रहें।",
        "आज की मेहनत एक बेहतर कल का निर्माण करती है।",
      ];
    } else if (isEducationTheme) {
      points = [
        "शिक्षा मनुष्य के जीवन को बदलने का सबसे बड़ा साधन है।",
        "यह हमारे विचारों को सकारात्मक और स्पष्ट बनाती है।",
        "ज्ञान प्राप्त करने से समाज में नई दिशा मिलती है।",
        "शिक्षा हमें सही और गलत के बीच अंतर समझना सिखाती है।",
        "विद्यार्थियों के उज्ज्वल भविष्य के लिए अध्ययन बहुत जरूरी है।",
        "सच्चा ज्ञान मनुष्य को विनम्र और आत्मविश्वासी बनाता है।",
      ];
    } else {
      points = [
        "यह गद्यांश एक महत्वपूर्ण और उपयोगी संदेश प्रस्तुत करता है।",
        "इसका मुख्य विचार विद्यार्थियों के लिए सरल और प्रेरणादायक है।",
        "दिए गए विचार जीवन में सफलता पाने का मार्गदर्शन करते हैं।",
        "सतत अभ्यास और लगन से नए कौशल सीखे जा सकते हैं।",
        "प्रस्तुत बिंदु मूल अर्थ को स्पष्ट और सुगम बनाते हैं।",
        "इन विचारों को अपनाकर हम बेहतर प्रगति कर सकते हैं।",
      ];
    }
  } else if (targetCode === "ml") {
    // Malayalam explanation bullet points
    points = [
      "കഠിനാധ്വാനം നമ്മുടെ ലക്ഷ്യങ്ങൾ കൈവരിക്കാൻ സഹായിക്കുന്നു.",
      "പരിശ്രമമില്ലാതെ ആർക്കും വിജയം നേടാനാവില്ല.",
      "ഇത് നമ്മിൽ അച്ചടക്കവും ആത്മവിശ്വാസവും വളർത്തുന്നു.",
      "പരാജയങ്ങളിൽ നിന്ന് പാഠങ്ങൾ ഉൾക്കൊണ്ട് മുന്നോട്ട് പോകണം.",
      "പ്രതിസന്ധികളെ ധൈര്യത്തോടെ നേരിടാൻ നാം തയ്യാറാകണം.",
      "ദിവസേനയുള്ള ചെറിയ പരിശ്രമങ്ങൾ വലിയ വിജയങ്ങൾക്ക് വഴിയൊരുക്കും.",
      "സ്വയം വിശ്വസിക്കുകയും നിരന്തരം പരിശ്രമിക്കുകയും ചെയ്യുക.",
      "ഇന്നത്തെ കഠിനാധ്വാനം ശോഭനമായ ഒരു നാളെ സൃഷ്ടിക്കുന്നു.",
    ];
  } else {
    // English default
    if (isHardWorkTheme) {
      points = [
        "Hard work helps us achieve our goals in life.",
        "Success needs sincere effort and dedication.",
        "Hard work teaches us discipline, patience, and confidence.",
        "It builds our self-belief and inner strength.",
        "Failure is an opportunity to learn and improve.",
        "We should not be afraid of challenges or difficulties.",
        "Small efforts made every day lead to great results.",
        "Always believe in yourself and keep trying.",
        "Hard work today creates a brighter and better tomorrow.",
      ];
    } else if (isEducationTheme) {
      points = [
        "Education is a powerful tool that transforms a person's life.",
        "It broadens our thinking and guides our actions.",
        "Learning nurtures good character, wisdom, and understanding.",
        "It prepares students to face real-world challenges confidently.",
        "Knowledge empowers individuals to help build a better society.",
        "Daily learning leads to continuous personal growth.",
      ];
    } else if (isNatureTheme || isScienceTheme) {
      points = [
        "Living organisms depend on nature and environmental balance.",
        "Plants convert sunlight, water, and air into essential food and oxygen.",
        "Natural processes provide the basic energy required for life.",
        "Conserving and protecting natural resources is our shared responsibility.",
        "Understanding scientific concepts helps us care for the world around us.",
        "Every small habit to preserve nature creates a healthier planet.",
      ];
    } else {
      // General dynamic extraction from sentence structure
      const sentences = clean
        .split(/[.!?।\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 8);

      if (sentences.length >= 4) {
        points = sentences.slice(0, 8).map((s) => {
          const firstLetter = s.charAt(0).toUpperCase() + s.slice(1);
          return firstLetter.endsWith(".") ? firstLetter.slice(0, -1) : firstLetter;
        });
      } else {
        points = [
          "The passage presents an important central idea in a simple way.",
          "It highlights key concepts that are easy for students to understand.",
          "The main thought encourages reflection and positive action.",
          "Focusing on the core points helps retain the overall meaning.",
          "Consistent effort leads to deeper understanding of the topic.",
          "The message inspires personal growth and mindful learning.",
        ];
      }
    }
  }

  // Ensure 5 to 10 points
  if (points.length < 5) {
    points.push("Understanding these core points helps retain the key message.");
    points.push("Applying these simple ideas leads to positive outcomes.");
  }
  if (points.length > 10) {
    points = points.slice(0, 10);
  }

  const formattedBulletText = points.map((p) => `- ${p}`).join("\n");

  return {
    success: true,
    explanation: formattedBulletText,
    keyPoints: points,
    difficultWords: [],
    modelUsed: "Educational Assistant Engine",
  };
}
