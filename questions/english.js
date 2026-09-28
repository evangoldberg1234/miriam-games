/* English: spelling and grammar. One choice is the standard form. */
(function (root) {
  function item(id, level, prompt, answer, wrongs, explain) {
    return {
      id: id,
      level: level,
      prompt: prompt,
      choices: [answer].concat(wrongs),
      answer: answer,
      explain: explain,
      speak: prompt,
      speakLang: "en-US"
    };
  }

  var items = [
    item("e1a", 1, "Which spelling is the animal that says meow?", "cat", ["kat", "catt", "cet"], "Cat is spelled c-a-t."),
    item("e1b", 1, "Which spelling is the animal that barks?", "dog", ["dawg", "dogg", "doog"], "Dog is spelled d-o-g."),
    item("e1c", 1, "Which spelling is the star we see in the daytime?", "sun", ["sunn", "sunne", "suhn"], "Sun is spelled s-u-n."),
    item("e1d", 1, "Which spelling means the color of grass?", "green", ["grene", "greene", "grean"], "Green is spelled g-r-e-e-n."),
    item("e1e", 1, "Which spelling is something you read?", "book", ["buk", "booke", "bok"], "Book is spelled b-o-o-k."),
    item("e1f", 1, "Which spelling is a place you live?", "home", ["hoam", "homm", "hoem"], "Home is spelled h-o-m-e."),

    item("e2a", 2, "Which spelling is correct?", "water", ["watter", "watur", "wahter"], "Water has one t."),
    item("e2b", 2, "Which spelling is correct?", "school", ["skool", "schol", "scool"], "School starts with s-c-h."),
    item("e2c", 2, "Which spelling is correct?", "friend", ["freind", "frend", "freand"], "Friend is f-r-i-e-n-d. I before e here."),
    item("e2d", 2, "Which spelling is correct?", "happy", ["happi", "happey", "hapey"], "Happy ends with y."),
    item("e2e", 2, "Which spelling is correct?", "tree", ["treee", "tre", "trea"], "Tree has two e's at the end."),
    item("e2f", 2, "Which spelling is correct?", "fish", ["phish", "fich", "fishe"], "Fish is f-i-s-h."),

    item("e3a", 3, "Which spelling is correct?", "because", ["becuz", "becaus", "becuase"], "Because is b-e-c-a-u-s-e."),
    item("e3b", 3, "Which spelling is correct?", "people", ["pepole", "peple", "peeple"], "People is p-e-o-p-l-e."),
    item("e3c", 3, "Which spelling is correct?", "night", ["nite", "ngiht", "nyght"], "Night is n-i-g-h-t."),
    item("e3d", 3, "Which spelling is correct?", "write", ["rite", "wriet", "wright"], "Write, the verb, is w-r-i-t-e."),
    item("e3e", 3, "Which spelling means to understand?", "know", ["no", "kno", "knowe"], "Know, meaning to understand, is k-n-o-w."),
    item("e3f", 3, "Which spelling is correct?", "their", ["thier", "ther", "thare"], "Their, meaning belonging to them, is t-h-e-i-r."),

    item("e4a", 4, "Which sentence is correct?", "The dogs run.", ["The dogs runs.", "The dogs running.", "Dogs runs fastly."], "Dogs is plural, so the verb is run."),
    item("e4b", 4, "Which sentence is correct?", "She is tall.", ["She are tall.", "She am tall.", "She be tall now."], "With she, we say is."),
    item("e4c", 4, "Which sentence is correct?", "I have two cats.", ["I has two cats.", "I haves two cats.", "I having two cats."], "With I, we say have."),
    item("e4d", 4, "Which sentence is correct?", "They were late.", ["They was late.", "They is late.", "They be late."], "They takes were in the past."),
    item("e4e", 4, "Which sentence is correct?", "The bird sings.", ["The bird sing.", "The bird singing.", "Bird the sings."], "One bird takes sings."),
    item("e4f", 4, "Which sentence is correct?", "We are ready.", ["We is ready.", "We am ready.", "We be ready."], "We takes are."),

    item("e5a", 5, "Which sentence uses a capital letter correctly?", "My name is Joy.", ["my name is joy.", "My Name is joy.", "my Name Is Joy."], "A sentence starts with a capital, and a name starts with a capital."),
    item("e5b", 5, "Which sentence is complete?", "The cat sat on the mat.", ["Sat on the mat.", "The cat on.", "Mat the."], "A complete sentence has a subject and a verb."),
    item("e5c", 5, "Where does the period go?", "I like bread.", ["I like bread", "I. like bread", ".I like bread"], "A telling sentence ends with a period."),
    item("e5d", 5, "Which question is written correctly?", "Where is the book?", ["Where is the book.", "where is the book?", "Where is the book??"], "A question starts with a capital and ends with one question mark."),
    item("e5e", 5, "Which word is a person's name and must start with a capital letter?", "Noah", ["river", "bridge", "morning"], "Noah is a person's name, so it starts with a capital letter."),
    item("e5f", 5, "Which sentence is correct?", "Monday is the first school day.", ["monday is the first school day", "Monday is the first school day", "monday is the first School day."], "Monday is the name of a day, and the sentence ends with a period."),

    item("e6a", 6, "Which phrase is correct?", "an apple", ["a apple", "an book", "a hour"], "Apple starts with a vowel sound, so we say an apple."),
    item("e6b", 6, "Which phrase is correct?", "a book", ["an book", "a apple", "an dog"], "Book starts with a consonant sound, so we say a book."),
    item("e6c", 6, "Which phrase is correct?", "an hour", ["a hour", "an school", "a orange"], "Hour starts with a vowel sound, so we say an hour."),
    item("e6d", 6, "Which phrase is correct?", "an orange", ["a orange", "an banana", "a elephant"], "Orange starts with a vowel sound."),
    item("e6e", 6, "Which phrase is correct?", "a uniform", ["an uniform", "a apple", "an kite"], "Uniform starts with a y sound, so we say a uniform."),
    item("e6f", 6, "Which phrase is correct?", "an egg", ["a egg", "an cat", "a owl"], "Egg starts with a vowel sound, so we say an egg."),

    item("e7a", 7, "Which spelling is the past tense of walk?", "walked", ["walkt", "walkded", "walkd"], "Walk adds ed: walked."),
    item("e7b", 7, "Which sentence is correct?", "She played outside.", ["She play outside.", "She playing outside.", "She playsed outside."], "Played is the past of play."),
    item("e7c", 7, "What is the past of go?", "went", ["goed", "goes", "going"], "Go becomes went in the past."),
    item("e7d", 7, "What is the past of see?", "saw", ["seed", "seen", "sawed"], "See becomes saw in the past. Seen needs a helper such as have."),
    item("e7e", 7, "Which sentence is correct?", "They ate lunch.", ["They eated lunch.", "They ated lunch.", "They eat lunch yesterday."], "Eat becomes ate in the past."),
    item("e7f", 7, "Which sentence is correct?", "I did my work.", ["I doed my work.", "I done my work yesterday.", "I dided my work."], "Do becomes did in the past."),

    item("e8a", 8, "The girls forgot ___ coats. Which word fits?", "their", ["there", "they're", "them"], "Their shows that the coats belong to them."),
    item("e8b", 8, "___ is a cat on the mat. Which word fits?", "There", ["Their", "They're", "Them"], "There points to a place: a cat is on the mat."),
    item("e8c", 8, "___ going to the park. Which word fits?", "They're", ["Their", "There", "Them"], "They're means they are."),
    item("e8d", 8, "Which sentence is correct?", "It's a sunny day.", ["Its a sunny day.", "Its' a sunny day.", "Its's a sunny day."], "It's means it is."),
    item("e8e", 8, "The tree lost ___ leaves. Which word fits?", "its", ["it's", "its'", "it"], "Its shows that the leaves belong to the tree. No apostrophe."),
    item("e8f", 8, "Which sentence is correct?", "You're my friend.", ["Your my friend.", "Youre my friend.", "Your'e my friend."], "You're means you are."),

    item("e9a", 9, "Which list uses commas correctly?", "I need a pen, a cup, and a map.", ["I need a pen a cup and a map.", "I need, a pen a cup and, a map.", "I, need a pen a cup and a map."], "Commas separate the items in the list."),
    item("e9b", 9, "Which sentence is correct?", "After lunch, we read.", ["After lunch we, read.", "After, lunch we read.", "After lunch we read,"], "A comma follows the opening After lunch."),
    item("e9c", 9, "Which sentence is correct?", "Yes, I can help.", ["Yes I, can help.", "Yes I can, help.", "Yes I can help"], "Yes at the start is followed by a comma, and the sentence ends with a period."),
    item("e9d", 9, "Which sentence is correct?", "The tall, quiet boy waved.", ["The tall quiet, boy waved.", "The, tall quiet boy waved.", "The tall quiet boy, waved."], "Two adjectives in a row, tall and quiet, take a comma between them."),
    item("e9e", 9, "Which sentence is correct?", "Mom said, \"Hello.\"", ["Mom said \"Hello.\".", "Mom, said Hello.", "Mom said, Hello"], "A comma comes before the spoken words, and the words sit in quotes."),
    item("e9f", 9, "Which sentence is correct?", "We visited Paris, France.", ["We visited Paris France.", "We visited, Paris France.", "We visited Paris, France"], "A comma separates the city and the country, and the sentence ends with a period."),

    item("e10a", 10, "Which sentence is correct?", "Neither of the boys is late.", ["Neither of the boys are late.", "Neither of the boys be late.", "Neither of the boys were late today only."], "Neither is singular, so the verb is is."),
    item("e10b", 10, "Which sentence is correct?", "Each of the girls has a book.", ["Each of the girls have a book.", "Each of the girls haves a book.", "Each of the girls having a book."], "Each is singular, so the verb is has."),
    item("e10c", 10, "Which sentence is correct?", "There are two birds.", ["There is two birds.", "There be two birds.", "There am two birds."], "Two birds is plural, so we say are."),
    item("e10d", 10, "Which sentence is correct?", "She and I are friends.", ["Her and I are friends.", "She and me are friends.", "Me and her is friends."], "She and I are the subject, so we use she and I."),
    item("e10e", 10, "Which sentence is correct?", "The book that I read was long.", ["The book what I read was long.", "The book who I read was long.", "The book whom was long."], "Who is for people. For a book, we say that or which."),
    item("e10f", 10, "Which sentence is correct?", "He runs faster than I do.", ["He runs more faster than I do.", "He runs faster then I do.", "He run more fast than me do."], "Faster already means more fast, and than compares. Then is about time.")
  ];

  root.Q_ENGLISH = items;
  if (typeof module !== "undefined" && module.exports) module.exports = items;
})(typeof globalThis !== "undefined" ? globalThis : this);
