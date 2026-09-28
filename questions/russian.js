/* Russian in Cyrillic, with ё where it is part of the spelling.
   No stress marks. */
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
    item("r1a", 1, "Which letter is A?", "А", ["Б", "В", "Г"], "А is the first Russian letter.", "А", "ru-RU"),
    item("r1b", 1, "Which letter is O?", "О", ["С", "Э", "Ю"], "О looks like the English O.", "О", "ru-RU"),
    item("r1c", 1, "Which letter is M?", "М", ["Н", "И", "Т"], "М looks like the English M.", "М", "ru-RU"),
    item("r1d", 1, "Which letter is K?", "К", ["Ж", "Х", "Н"], "К looks like the English K.", "К", "ru-RU"),
    item("r1e", 1, "Which letter is T?", "Т", ["П", "Г", "Ш"], "Т looks like the English T.", "Т", "ru-RU"),
    item("r1f", 1, "Which letter is C, the one that says S?", "С", ["К", "У", "Ф"], "Russian С says S. It is not the English C sound.", "С", "ru-RU"),

    item("r2a", 2, "Which letter is Yo?", "Ё", ["Е", "Э", "Ю"], "Ё says yo. The two dots make it different from Е.", "Ё", "ru-RU"),
    item("r2b", 2, "Which letter is Zh?", "Ж", ["З", "Х", "Ш"], "Ж says zh, as in the middle of measure.", "Ж", "ru-RU"),
    item("r2c", 2, "Which letter is Sh?", "Ш", ["Щ", "Ч", "Ц"], "Ш says sh.", "Ш", "ru-RU"),
    item("r2d", 2, "Which letter is Ch?", "Ч", ["Ц", "Ш", "Щ"], "Ч says ch.", "Ч", "ru-RU"),
    item("r2e", 2, "Which letter is Ya?", "Я", ["Ю", "А", "Р"], "Я says ya.", "Я", "ru-RU"),
    item("r2f", 2, "Which letter is Yu?", "Ю", ["Я", "У", "Ё"], "Ю says yu.", "Ю", "ru-RU"),

    item("r3a", 3, "What does мама mean?", "mom", ["dad", "cat", "house"], "Мама means mom.", "мама", "ru-RU"),
    item("r3b", 3, "What does папа mean?", "dad", ["mom", "brother", "baby"], "Папа means dad.", "папа", "ru-RU"),
    item("r3c", 3, "What does кот mean?", "cat", ["dog", "bird", "fish"], "Кот means a male cat.", "кот", "ru-RU"),
    item("r3d", 3, "What does дом mean?", "house", ["book", "water", "school"], "Дом means house or home.", "дом", "ru-RU"),
    item("r3e", 3, "What does сок mean?", "juice", ["soup", "bread", "milk"], "Сок means juice.", "сок", "ru-RU"),
    item("r3f", 3, "What does мяч mean?", "ball", ["book", "table", "pen"], "Мяч means ball.", "мяч", "ru-RU"),

    item("r4a", 4, "What does вода mean?", "water", ["milk", "bread", "honey"], "Вода means water.", "вода", "ru-RU"),
    item("r4b", 4, "What does хлеб mean?", "bread", ["water", "apple", "soup"], "Хлеб means bread.", "хлеб", "ru-RU"),
    item("r4c", 4, "What does книга mean?", "book", ["pen", "school", "table"], "Книга means book.", "книга", "ru-RU"),
    item("r4d", 4, "What does школа mean?", "school", ["house", "book", "friend"], "Школа means school.", "школа", "ru-RU"),
    item("r4e", 4, "What does рыба mean?", "fish", ["bird", "cow", "horse"], "Рыба means fish.", "рыба", "ru-RU"),
    item("r4f", 4, "What does дерево mean?", "tree", ["flower", "house", "sun"], "Дерево means tree.", "дерево", "ru-RU"),

    item("r5a", 5, "What does солнце mean?", "sun", ["moon", "star", "cloud"], "Солнце means the sun.", "солнце", "ru-RU"),
    item("r5b", 5, "What does луна mean?", "moon", ["sun", "star", "sky"], "Луна means the moon.", "луна", "ru-RU"),
    item("r5c", 5, "What does птица mean?", "bird", ["fish", "cat", "dog"], "Птица means bird.", "птица", "ru-RU"),
    item("r5d", 5, "What does цветок mean?", "flower", ["tree", "grass", "leaf"], "Цветок means flower.", "цветок", "ru-RU"),
    item("r5e", 5, "What does друг mean?", "friend", ["teacher", "baby", "sister"], "Друг means a male friend.", "друг", "ru-RU"),
    item("r5f", 5, "What does праздник mean?", "holiday", ["school", "morning", "book"], "Праздник means a holiday or celebration.", "праздник", "ru-RU"),

    item("r6a", 6, "What does Шаббат mean?", "Shabbat", ["Torah", "sukkah", "matzah"], "Шаббат is Shabbat.", "Шаббат", "ru-RU"),
    item("r6b", 6, "What does Тора mean?", "Torah", ["Shabbat", "prayer", "synagogue"], "Тора is the Torah.", "Тора", "ru-RU"),
    item("r6c", 6, "What does сукка mean?", "sukkah", ["lulav", "etrog", "shofar"], "Сукка is the sukkah.", "сукка", "ru-RU"),
    item("r6d", 6, "What does ёлка mean?", "fir tree", ["flower", "book", "moon"], "Ёлка is a fir tree, the kind used as a New Year tree.", "ёлка", "ru-RU"),
    item("r6e", 6, "What does мёд mean?", "honey", ["milk", "water", "bread"], "Мёд means honey. The letter ё is part of the word.", "мёд", "ru-RU"),
    item("r6f", 6, "What does ребёнок mean?", "child", ["grandpa", "teacher", "friend"], "Ребёнок means a child.", "ребёнок", "ru-RU"),

    item("r7a", 7, "What does Это кот. mean?", "This is a cat.", ["This is a dog.", "This is a house.", "This is a book."], "Это means this is. Кот means cat.", "Это кот.", "ru-RU"),
    item("r7b", 7, "What does Мама дома. mean?", "Mom is at home.", ["Dad is at home.", "Mom is at school.", "The cat is at home."], "Мама is mom. Дома means at home.", "Мама дома.", "ru-RU"),
    item("r7c", 7, "What does Это книга. mean?", "This is a book.", ["This is a pen.", "This is water.", "This is a school."], "Книга means book.", "Это книга.", "ru-RU"),
    item("r7d", 7, "What does Папа здесь. mean?", "Dad is here.", ["Mom is here.", "Dad is at school.", "The child is here."], "Папа is dad. Здесь means here.", "Папа здесь.", "ru-RU"),
    item("r7e", 7, "What does Это дом. mean?", "This is a house.", ["This is a tree.", "This is a ball.", "This is juice."], "Дом means house.", "Это дом.", "ru-RU"),
    item("r7f", 7, "What does Я здесь. mean?", "I am here.", ["You are here.", "Mom is here.", "I am at school."], "Я means I. Здесь means here.", "Я здесь.", "ru-RU"),

    item("r8a", 8, "What does Я читаю книгу. mean?", "I am reading a book.", ["I am eating bread.", "Mom is reading a book.", "I am drinking water."], "Читаю means I am reading. Книгу is book, as the object.", "Я читаю книгу.", "ru-RU"),
    item("r8b", 8, "What does Мама пьёт воду. mean?", "Mom is drinking water.", ["Mom is reading a book.", "Dad is drinking water.", "Mom is eating bread."], "Пьёт means is drinking. Воду is water, as the object.", "Мама пьёт воду.", "ru-RU"),
    item("r8c", 8, "What does Кот сидит дома. mean?", "The cat is sitting at home.", ["The dog is sitting at home.", "The cat is at school.", "Mom is sitting at home."], "Кот is the cat. Сидит means is sitting. Дома means at home.", "Кот сидит дома.", "ru-RU"),
    item("r8d", 8, "What does Сегодня праздник. mean?", "Today is a holiday.", ["Tomorrow is a holiday.", "Today is school.", "Yesterday was a holiday."], "Сегодня means today. Праздник means a holiday.", "Сегодня праздник.", "ru-RU"),
    item("r8e", 8, "What does Это ёлка. mean?", "This is a fir tree.", ["This is a flower.", "This is honey.", "This is a child."], "Ёлка means fir tree.", "Это ёлка.", "ru-RU"),
    item("r8f", 8, "What does Дети читают. mean?", "The children are reading.", ["The children are sleeping.", "Mom is reading.", "The child is eating."], "Дети means children. Читают means are reading.", "Дети читают.", "ru-RU"),

    item("r9a", 9, "What does У меня есть кот. mean?", "I have a cat.", ["I have a dog.", "Mom has a cat.", "I have a book."], "У меня есть means I have. Кот means cat.", "У меня есть кот.", "ru-RU"),
    item("r9b", 9, "What does Папа читает книгу. mean?", "Dad is reading a book.", ["Mom is reading a book.", "Dad is drinking water.", "The boy is eating bread."], "Папа is dad. Читает means is reading. Книгу means a book.", "Папа читает книгу.", "ru-RU"),
    item("r9c", 9, "What does Солнце на небе. mean?", "The sun is in the sky.", ["The moon is in the sky.", "The sun is in the house.", "The bird is in the sky."], "Солнце is the sun. На небе means in the sky.", "Солнце на небе.", "ru-RU"),
    item("r9d", 9, "What does Мы любим Шаббат. mean?", "We love Shabbat.", ["We love school.", "They love Shabbat.", "We read the Torah."], "Мы means we. Любим means we love. Шаббат is Shabbat.", "Мы любим Шаббат.", "ru-RU"),
    item("r9e", 9, "What does Это сладкий мёд. mean?", "This is sweet honey.", ["This is sweet milk.", "This is a fir tree.", "This is sour honey."], "Сладкий means sweet. Мёд means honey.", "Это сладкий мёд.", "ru-RU"),
    item("r9f", 9, "What does В доме тепло. mean?", "It is warm in the house.", ["It is cold in the house.", "It is warm at school.", "The house is new."], "В доме means in the house. Тепло means warm.", "В доме тепло.", "ru-RU"),

    item("r10a", 10, "What does Сегодня праздник Суккот. mean?", "Today is the holiday of Sukkot.", ["Today is Shabbat.", "Tomorrow is Sukkot.", "Today is Pesach."], "Сегодня праздник means today is a holiday. Суккот is Sukkot.", "Сегодня праздник Суккот.", "ru-RU"),
    item("r10b", 10, "What does Семья строит сукку. mean?", "The family is building a sukkah.", ["The family is in the house.", "The children are reading.", "Dad is building a school."], "Семья is the family. Строит means is building. Сукку is the sukkah, as the object.", "Семья строит сукку.", "ru-RU"),
    item("r10c", 10, "What does Мы читаем Тору. mean?", "We are reading the Torah.", ["We are reading a book of stories.", "They are reading the Torah.", "We love Shabbat."], "Мы читаем means we are reading. Тору is the Torah, as the object.", "Мы читаем Тору.", "ru-RU"),
    item("r10d", 10, "What does На столе лежат яблоки. mean?", "Apples are on the table.", ["Bread is on the table.", "Apples are in the bag.", "The book is on the table."], "На столе means on the table. Яблоки means apples.", "На столе лежат яблоки.", "ru-RU"),
    item("r10e", 10, "What does Ребёнок ест хлеб. mean?", "The child is eating bread.", ["The child is drinking water.", "Mom is eating bread.", "The child is reading."], "Ребёнок is a child. Ест means is eating. Хлеб is bread.", "Ребёнок ест хлеб.", "ru-RU"),
    item("r10f", 10, "What does Луна светит ночью. mean?", "The moon shines at night.", ["The sun shines at night.", "The moon shines in the morning.", "The star is a book."], "Луна is the moon. Светит means shines. Ночью means at night.", "Луна светит ночью.", "ru-RU")
  ];

  root.Q_RUSSIAN = items;
  if (typeof module !== "undefined" && module.exports) module.exports = items;
})(typeof globalThis !== "undefined" ? globalThis : this);
