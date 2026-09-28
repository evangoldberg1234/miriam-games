/* Hebrew, with nikud. Letter shapes, vowel names, then words and
   short sentences. Spellings match the checked word list used on this site. */
(function (root) {
  function item(id, level, prompt, answer, wrongs, explain, speak, speakLang) {
    return {
      id: id,
      level: level,
      prompt: prompt,
      choices: [answer].concat(wrongs),
      answer: answer,
      explain: explain,
      speak: speak || prompt,
      speakLang: speakLang || "en-US"
    };
  }

  var items = [
    item("h1a", 1, "Which letter is alef?", "א", ["ב", "ג", "ד"], "Alef is the first letter of the Hebrew alphabet.", "alef"),
    item("h1b", 1, "Which letter is bet?", "ב", ["א", "ל", "מ"], "Bet is the second letter.", "bet"),
    item("h1c", 1, "Which letter is gimel?", "ג", ["ד", "ה", "ו"], "Gimel is the third letter.", "gimel"),
    item("h1d", 1, "Which letter is dalet?", "ד", ["ר", "ה", "ז"], "Dalet is the fourth letter. It is not resh.", "dalet"),
    item("h1e", 1, "Which letter is hey?", "ה", ["ח", "ת", "א"], "Hey is a different letter from het and tav.", "hey"),
    item("h1f", 1, "Which letter is vav?", "ו", ["ז", "ן", "י"], "Vav is a straight letter. Zayin has a little roof.", "vav"),

    item("h2a", 2, "What is the vowel mark under the bet in בָּ?", "Kamatz", ["Patach", "Segol", "Hiriq"], "Kamatz looks like a small T under the letter. בָּ says ba.", "בָּ", "he-IL"),
    item("h2b", 2, "What is the vowel mark under the bet in בַּ?", "Patach", ["Kamatz", "Tzere", "Holam"], "Patach is a flat line under the letter. בַּ says ba.", "בַּ", "he-IL"),
    item("h2c", 2, "What is the vowel mark under the bet in בֶּ?", "Segol", ["Tzere", "Kamatz", "Shuruk"], "Segol is three dots, like a triangle. בֶּ says beh.", "בֶּ", "he-IL"),
    item("h2d", 2, "What is the vowel mark under the bet in בֵּ?", "Tzere", ["Segol", "Hiriq", "Patach"], "Tzere is two dots side by side. בֵּ says beh.", "בֵּ", "he-IL"),
    item("h2e", 2, "What is the vowel mark under the bet in בִּ?", "Hiriq", ["Holam", "Kamatz", "Patach"], "Hiriq is one dot under the letter. בִּ says bee.", "בִּ", "he-IL"),
    item("h2f", 2, "What is the vowel mark on the bet in בֹּ?", "Holam", ["Shuruk", "Hiriq", "Segol"], "Holam is a dot above the letter, toward the left. בֹּ says bo.", "בֹּ", "he-IL"),

    item("h3a", 3, "Which syllable says ba?", "בָּ", ["בִּ", "בּוֹ", "בּוּ"], "Kamatz under bet makes ba.", "בָּ", "he-IL"),
    item("h3b", 3, "Which syllable says bee?", "בִּ", ["בָּ", "בֵּ", "בּוֹ"], "Hiriq under bet makes bee.", "בִּ", "he-IL"),
    item("h3c", 3, "Which syllable says bo?", "בּוֹ", ["בָּ", "בִּ", "בֶּ"], "Vav with holam after bet makes bo.", "בּוֹ", "he-IL"),
    item("h3d", 3, "Which syllable says bu?", "בּוּ", ["בֹּ", "בַּ", "בֵּ"], "Vav with a shuruk dot makes bu.", "בּוּ", "he-IL"),
    item("h3e", 3, "Which syllable says ma?", "מָ", ["מִ", "מוֹ", "בָּ"], "Mem with kamatz says ma.", "מָ", "he-IL"),
    item("h3f", 3, "Which syllable says li?", "לִ", ["לָ", "לוֹ", "בִּ"], "Lamed with hiriq says li.", "לִ", "he-IL"),

    item("h4a", 4, "What does חָתוּל mean?", "cat", ["dog", "bird", "fish"], "חָתוּל means cat.", "חָתוּל", "he-IL"),
    item("h4b", 4, "What does כֶּלֶב mean?", "dog", ["cat", "horse", "cow"], "כֶּלֶב means dog.", "כֶּלֶב", "he-IL"),
    item("h4c", 4, "What does אִמָּא mean?", "mom", ["dad", "baby", "sister"], "אִמָּא means mom.", "אִמָּא", "he-IL"),
    item("h4d", 4, "What does אַבָּא mean?", "dad", ["mom", "brother", "grandpa"], "אַבָּא means dad.", "אַבָּא", "he-IL"),
    item("h4e", 4, "What does מַיִם mean?", "water", ["bread", "milk", "honey"], "מַיִם means water.", "מַיִם", "he-IL"),
    item("h4f", 4, "What does לֶחֶם mean?", "bread", ["water", "apple", "soup"], "לֶחֶם means bread.", "לֶחֶם", "he-IL"),

    item("h5a", 5, "Which Hebrew word means book?", "סֵפֶר", ["עֵט", "שֻׁלְחָן", "חָבֵר"], "סֵפֶר means book.", "סֵפֶר", "he-IL"),
    item("h5b", 5, "Which Hebrew word means fish?", "דָּג", ["צִפּוֹר", "סוּס", "פָּרָה"], "דָּג means fish.", "דָּג", "he-IL"),
    item("h5c", 5, "Which Hebrew word means milk?", "חָלָב", ["מַיִם", "לֶחֶם", "דְּבַשׁ"], "חָלָב means milk.", "חָלָב", "he-IL"),
    item("h5d", 5, "Which Hebrew word means apple?", "תַּפּוּחַ", ["בֵּיצָה", "מָרָק", "עוּגִיָּה"], "תַּפּוּחַ means apple.", "תַּפּוּחַ", "he-IL"),
    item("h5e", 5, "Which Hebrew word means horse?", "סוּס", ["כֶּלֶב", "חָתוּל", "גָּמָל"], "סוּס means horse.", "סוּס", "he-IL"),
    item("h5f", 5, "Which Hebrew word means dove?", "יוֹנָה", ["צִפּוֹר", "דָּג", "דְּבוֹרָה"], "יוֹנָה means dove.", "יוֹנָה", "he-IL"),

    item("h6a", 6, "What does שַׁבָּת mean?", "Shabbat", ["Torah", "sukkah", "matzah"], "שַׁבָּת is Shabbat.", "שַׁבָּת", "he-IL"),
    item("h6b", 6, "What does תּוֹרָה mean?", "Torah", ["Shabbat", "prayer", "candle"], "תּוֹרָה is the Torah.", "תּוֹרָה", "he-IL"),
    item("h6c", 6, "What does סֻכָּה mean?", "sukkah", ["lulav", "etrog", "shofar"], "סֻכָּה is the sukkah, the booth for Sukkot.", "סֻכָּה", "he-IL"),
    item("h6d", 6, "What does אֶתְרוֹג mean?", "etrog", ["lulav", "matzah", "shofar"], "אֶתְרוֹג is the etrog, the citron of Sukkot.", "אֶתְרוֹג", "he-IL"),
    item("h6e", 6, "What does לוּלָב mean?", "lulav", ["etrog", "sukkah", "kippah"], "לוּלָב is the palm branch used on Sukkot.", "לוּלָב", "he-IL"),
    item("h6f", 6, "What does מַצָּה mean?", "matzah", ["challah", "honey", "bread"], "מַצָּה is matzah, the flat bread of Pesach.", "מַצָּה", "he-IL"),

    item("h7a", 7, "What does שַׁבָּת שָׁלוֹם mean?", "Shabbat shalom", ["Good morning", "Thank you", "Good night"], "שָׁלוֹם means peace. This greeting is for Shabbat.", "שַׁבָּת שָׁלוֹם", "he-IL"),
    item("h7b", 7, "What does בֹּקֶר טוֹב mean?", "Good morning", ["Good night", "Thank you", "Happy holiday"], "בֹּקֶר is morning and טוֹב is good.", "בֹּקֶר טוֹב", "he-IL"),
    item("h7c", 7, "What does לַיְלָה טוֹב mean?", "Good night", ["Good morning", "Shabbat shalom", "Thank you"], "לַיְלָה is night and טוֹב is good.", "לַיְלָה טוֹב", "he-IL"),
    item("h7d", 7, "What does תּוֹדָה רַבָּה mean?", "Thank you very much", ["Good morning", "Happy holiday", "See you"], "תּוֹדָה is thanks and רַבָּה means a lot.", "תּוֹדָה רַבָּה", "he-IL"),
    item("h7e", 7, "What does חַג שָׂמֵחַ mean?", "Happy holiday", ["Good night", "Thank you", "Good morning"], "חַג is a holiday and שָׂמֵחַ means happy.", "חַג שָׂמֵחַ", "he-IL"),
    item("h7f", 7, "What does שָׁלוֹם mean?", "Peace, or hello", ["Book", "Water", "Night"], "שָׁלוֹם means peace. People also say it as hello.", "שָׁלוֹם", "he-IL"),

    item("h8a", 8, "What does הַכֶּלֶב גָּדוֹל mean?", "The dog is big.", ["The cat is big.", "The dog is small.", "The book is big."], "הַכֶּלֶב is the dog. גָּדוֹל means big.", "הַכֶּלֶב גָּדוֹל", "he-IL"),
    item("h8b", 8, "What does זֶה סֵפֶר mean?", "This is a book.", ["This is a pen.", "This is water.", "This is a house."], "זֶה means this. סֵפֶר means book.", "זֶה סֵפֶר", "he-IL"),
    item("h8c", 8, "What does אִמָּא בַּבַּיִת mean?", "Mom is in the house.", ["Dad is in the house.", "Mom is at school.", "The dog is in the house."], "אִמָּא is mom. בַּבַּיִת means in the house.", "אִמָּא בַּבַּיִת", "he-IL"),
    item("h8d", 8, "What does הַיֶּלֶד קוֹרֵא mean?", "The boy is reading.", ["The girl is reading.", "The boy is eating.", "The boy is sleeping."], "הַיֶּלֶד is the boy. קוֹרֵא means is reading.", "הַיֶּלֶד קוֹרֵא", "he-IL"),
    item("h8e", 8, "What does הַסֻּכָּה יָפָה mean?", "The sukkah is pretty.", ["The sukkah is big.", "The house is pretty.", "The etrog is pretty."], "הַסֻּכָּה is the sukkah. יָפָה means pretty.", "הַסֻּכָּה יָפָה", "he-IL"),
    item("h8f", 8, "What does הַיַּלְדָּה קוֹרֵאת סֵפֶר mean?", "The girl is reading a book.", ["The boy is reading a book.", "The girl is eating bread.", "Mom is reading a book."], "הַיַּלְדָּה is the girl. קוֹרֵאת means is reading. סֵפֶר is a book.", "הַיַּלְדָּה קוֹרֵאת סֵפֶר", "he-IL"),

    item("h9a", 9, "In הַכֶּלֶב גָּדוֹל, which word means the dog?", "הַכֶּלֶב", ["גָּדוֹל", "סֵפֶר", "אִמָּא"], "הַכֶּלֶב means the dog. גָּדוֹל means big.", "הַכֶּלֶב", "he-IL"),
    item("h9b", 9, "In זֶה סֵפֶר, which word means book?", "סֵפֶר", ["זֶה", "לֶחֶם", "כֶּלֶב"], "סֵפֶר means book. זֶה means this.", "סֵפֶר", "he-IL"),
    item("h9c", 9, "In אִמָּא בַּבַּיִת, which word means mom?", "אִמָּא", ["בַּבַּיִת", "אַבָּא", "יֶלֶד"], "אִמָּא means mom. בַּבַּיִת means in the house.", "אִמָּא", "he-IL"),
    item("h9d", 9, "In הַיֶּלֶד קוֹרֵא, which word means the boy?", "הַיֶּלֶד", ["קוֹרֵא", "הַיַּלְדָּה", "סֵפֶר"], "הַיֶּלֶד means the boy.", "הַיֶּלֶד", "he-IL"),
    item("h9e", 9, "In הַיַּלְדָּה קוֹרֵאת סֵפֶר, which word means book?", "סֵפֶר", ["הַיַּלְדָּה", "קוֹרֵאת", "לֶחֶם"], "סֵפֶר means book.", "סֵפֶר", "he-IL"),
    item("h9f", 9, "In הַיֶּלֶד אוֹכֵל לֶחֶם, which word means bread?", "לֶחֶם", ["אוֹכֵל", "הַיֶּלֶד", "מַיִם"], "לֶחֶם means bread. אוֹכֵל means is eating.", "לֶחֶם", "he-IL"),

    item("h10a", 10, "What does הַיֶּלֶד אוֹכֵל לֶחֶם mean?", "The boy is eating bread.", ["The boy is reading a book.", "The girl is eating bread.", "Mom is eating bread."], "הַיֶּלֶד is the boy. אוֹכֵל means is eating. לֶחֶם is bread.", "הַיֶּלֶד אוֹכֵל לֶחֶם", "he-IL"),
    item("h10b", 10, "What does אִמָּא קוֹרֵאת סֵפֶר mean?", "Mom is reading a book.", ["Dad is reading a book.", "Mom is in the house.", "The girl is eating bread."], "אִמָּא is mom. קוֹרֵאת means is reading. סֵפֶר is a book.", "אִמָּא קוֹרֵאת סֵפֶר", "he-IL"),
    item("h10c", 10, "What does הַמִּשְׁפָּחָה בַּסֻּכָּה mean?", "The family is in the sukkah.", ["The family is in the house.", "The boy is in the sukkah.", "The sukkah is pretty."], "הַמִּשְׁפָּחָה is the family. בַּסֻּכָּה means in the sukkah.", "הַמִּשְׁפָּחָה בַּסֻּכָּה", "he-IL"),
    item("h10d", 10, "What does זֶה לוּלָב mean?", "This is a lulav.", ["This is an etrog.", "This is a sukkah.", "This is a book."], "זֶה means this. לוּלָב is the lulav.", "זֶה לוּלָב", "he-IL"),
    item("h10e", 10, "What does זֶה אֶתְרוֹג mean?", "This is an etrog.", ["This is a lulav.", "This is matzah.", "This is a shofar."], "זֶה means this. אֶתְרוֹג is the etrog.", "זֶה אֶתְרוֹג", "he-IL"),
    item("h10f", 10, "What does הַיַּלְדָּה אוֹכֶלֶת לֶחֶם mean?", "The girl is eating bread.", ["The boy is eating bread.", "The girl is reading a book.", "Mom is reading a book."], "הַיַּלְדָּה is the girl. אוֹכֶלֶת means is eating. לֶחֶם is bread.", "הַיַּלְדָּה אוֹכֶלֶת לֶחֶם", "he-IL")
  ];

  root.Q_HEBREW = items;
  if (typeof module !== "undefined" && module.exports) module.exports = items;
})(typeof globalThis !== "undefined" ? globalThis : this);
