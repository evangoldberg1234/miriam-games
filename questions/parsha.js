/* Torah portions, stories, and holidays, including Sukkot 5787.
   Dates follow the Hebcal diaspora calendar:
   Erev Sukkot 2026-09-25, Sukkot through Hoshana Rabbah 2026-10-02,
   Shemini Atzeret 2026-10-03, Simchat Torah 2026-10-04. */
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
    item("p1a", 1, "Who built the ark before the flood?", "Noach", ["Avraham", "Moshe", "David"], "In Bereishit, Noach built the ark."),
    item("p1b", 1, "In the Torah, the first woman is named what?", "Chava", ["Sarah", "Rivkah", "Miriam"], "Adam and Chava are the first people in Bereishit."),
    item("p1c", 1, "How many books are in the Torah?", "5", ["3", "7", "24"], "The Torah has five books: Bereishit, Shemot, Vayikra, Bamidbar, and Devarim."),
    item("p1d", 1, "Shabbat is which day of the week in the Torah's count?", "The seventh day", ["The first day", "The third day", "The tenth day"], "Bereishit says Hashem rested on the seventh day."),
    item("p1e", 1, "Who led the people out of Egypt?", "Moshe", ["Noach", "Yosef", "David"], "The book of Shemot tells how Moshe led the people out."),
    item("p1f", 1, "Which holiday is the one with a sukkah?", "Sukkot", ["Purim", "Chanukah", "Shavuot"], "On Sukkot we eat in the sukkah."),

    item("p2a", 2, "Who was Avraham's wife?", "Sarah", ["Rivkah", "Rachel", "Leah"], "Avraham and Sarah are the first patriarch and matriarch."),
    item("p2b", 2, "Who was Yitzhak's wife?", "Rivkah", ["Sarah", "Rachel", "Leah"], "Yitzhak married Rivkah."),
    item("p2c", 2, "How many sons did Yaakov have?", "12", ["2", "7", "10"], "Yaakov had twelve sons. They become the tribes."),
    item("p2d", 2, "Yosef's brothers sent him away. Which land did he end up in?", "Egypt", ["Babylon", "Moav", "Spain"], "The Torah says Yosef was taken down to Egypt."),
    item("p2e", 2, "Baby Moshe was hidden in a basket by a river in Egypt. What do we call that river?", "The Nile", ["The Jordan", "The Euphrates", "The Tigris"], "The Torah calls it the river of Egypt. We know it as the Nile."),
    item("p2f", 2, "At the sea, who held out his staff so the people could cross?", "Moshe", ["Aharon", "Miriam", "Yehoshua"], "Shemot says Moshe stretched out his hand over the sea."),

    item("p3a", 3, "Where was the Torah given?", "Mount Sinai", ["Mount Carmel", "The Mount of Olives", "Mount Hermon"], "The Torah tells that Hashem spoke to the people at Sinai."),
    item("p3b", 3, "How many commandments are in the Ten Commandments?", "10", ["5", "7", "12"], "They are called the Ten Commandments because there are ten."),
    item("p3c", 3, "What food fell with the dew for the people in the desert?", "Manna", ["Matzah from a store", "Apples", "Fish from the sea"], "Shemot says the manna was on the ground with the morning dew."),
    item("p3d", 3, "Who was Moshe's sister?", "Miriam", ["Sarah", "Ruth", "Esther"], "Miriam is Moshe and Aharon's sister."),
    item("p3e", 3, "Who was Moshe's brother, the first Kohen Gadol?", "Aharon", ["Yehoshua", "Kalev", "Hur"], "Aharon was Moshe's brother and the first high priest."),
    item("p3f", 3, "Which holiday is the one of matzah, remembering the leaving of Egypt?", "Pesach", ["Sukkot", "Purim", "Chanukah"], "On Pesach we eat matzah and tell the story of leaving Egypt."),

    item("p4a", 4, "Sukkot begins on the 15th of which Hebrew month?", "Tishrei", ["Nisan", "Sivan", "Kislev"], "Sukkot is 15 Tishrei. Pesach is 15 Nisan."),
    item("p4b", 4, "On the diaspora calendar, the evening Sukkot 5787 begins is which date?", "September 25, 2026", ["September 20, 2026", "October 3, 2026", "October 4, 2026"], "Hebcal lists Erev Sukkot on September 25, 2026, which is 14 Tishrei as the day ends."),
    item("p4c", 4, "Hoshana Rabbah is the seventh day of Sukkot. In 5787, which date is that?", "October 2, 2026", ["September 25, 2026", "October 3, 2026", "October 4, 2026"], "Hebcal lists Sukkot VII, Hoshana Rabbah, on October 2, 2026."),
    item("p4d", 4, "The day right after the seven days of Sukkot, October 3, 2026, is called what?", "Shemini Atzeret", ["Simchat Torah", "Yom Kippur", "Purim"], "On the diaspora calendar Shemini Atzeret is October 3, 2026."),
    item("p4e", 4, "On the diaspora calendar, Simchat Torah 5787 is which date?", "October 4, 2026", ["October 2, 2026", "October 3, 2026", "September 26, 2026"], "Hebcal lists Simchat Torah on October 4, 2026. In Israel that celebration is combined with Shemini Atzeret."),
    item("p4f", 4, "In the diaspora, Shemini Atzeret and Simchat Torah are how many days?", "Two separate days", ["The same one day", "A whole week", "Only in the summer"], "Outside Israel, Shemini Atzeret comes first and Simchat Torah is the next day."),

    item("p5a", 5, "Which fruit is one of the four species of Sukkot?", "Etrog", ["Apple", "Grape", "Pomegranate"], "The four species are etrog, lulav, hadas, and aravah. A pomegranate is one of the seven species, not one of these four."),
    item("p5b", 5, "The lulav comes from which tree?", "The date palm", ["The olive tree", "The cedar", "The fig tree"], "The lulav is a closed palm branch."),
    item("p5c", 5, "Hadas, one of the four species, is which plant?", "Myrtle", ["Willow", "Palm", "Olive"], "Hadas is myrtle. Aravah is willow."),
    item("p5d", 5, "Aravah, one of the four species, is which plant?", "Willow", ["Myrtle", "Palm", "Cedar"], "Aravah is willow. Hadas is myrtle."),
    item("p5e", 5, "On Sukkot, where do we eat our meals?", "In the sukkah", ["Only in a closed attic", "Only on a boat", "Only in the dark"], "The Torah says to live in the sukkah for seven days."),
    item("p5f", 5, "What is the roof of a sukkah made from?", "Branches or bamboo, called schach", ["A solid metal roof", "Glass only", "No roof at all"], "Schach is plant material, and you do not use a finished solid roof."),

    item("p6a", 6, "On Simchat Torah we finish the Torah and start again at which book?", "Bereishit", ["Shemot", "Vayikra", "Devarim"], "We read the end, then begin again at Bereishit."),
    item("p6b", 6, "Shemini Atzeret comes right after which holiday?", "Sukkot", ["Pesach", "Purim", "Chanukah"], "Shemini Atzeret is the gathering on the day after Sukkot."),
    item("p6c", 6, "On Simchat Torah, people dance with what?", "Torah scrolls", ["A shofar", "An etrog", "A menorah"], "The celebration is dancing with the Torah."),
    item("p6d", 6, "Which Torah portion is the last one of the year?", "V'Zot HaBerachah", ["Bereishit", "Noach", "Lech Lecha"], "V'Zot HaBerachah is the last portion. Bereishit starts the year again."),
    item("p6e", 6, "On which day do we not shake the lulav?", "Shabbat", ["Sunday", "Hoshana Rabbah when it is a weekday", "The first night only"], "We shake the four species on the days of Sukkot, but not on Shabbat."),
    item("p6f", 6, "Ushpizin are special guests we welcome into the sukkah. Which of these is one of them?", "Avraham", ["Haman", "Pharaoh", "Goliath"], "The traditional ushpizin include Avraham, Yitzhak, Yaakov, Yosef, Moshe, Aharon, and David."),

    item("p7a", 7, "Who was the son of Avraham and Sarah?", "Yitzhak", ["Yishmael", "Yaakov", "Yosef"], "Sarah's son was Yitzhak. Yishmael was Avraham's son with Hagar."),
    item("p7b", 7, "Rivkah's younger twin son was who?", "Yaakov", ["Esav", "Yosef", "Yehuda"], "Esav was born first. Yaakov was the younger twin."),
    item("p7c", 7, "Rachel and Leah were sisters. Who was Rachel's sister?", "Leah", ["Rivkah", "Sarah", "Dinah"], "Yaakov married the sisters Rachel and Leah. Dinah was their family's daughter, not Rachel's sister."),
    item("p7d", 7, "Who was Yosef's father?", "Yaakov", ["Yitzhak", "Avraham", "Moshe"], "Yosef was the son of Yaakov and Rachel."),
    item("p7e", 7, "King David comes from which son's family?", "Yehuda", ["Yosef", "Dan", "Gad"], "The Torah's family line brings David from Yehuda."),
    item("p7f", 7, "The tribes of Israel come from the sons of Yaakov. How many sons did he have?", "12", ["7", "10", "40"], "Twelve sons, twelve tribes."),

    item("p8a", 8, "Who saw the burning bush?", "Moshe", ["Avraham", "Noach", "David"], "Shemot tells that Moshe saw the bush that burned and was not used up."),
    item("p8b", 8, "What was the first plague in Egypt?", "Blood", ["Frogs", "Darkness", "Hail"], "The first plague turned the water into blood. Frogs came next."),
    item("p8c", 8, "Who spoke Hashem's words to Pharaoh?", "Moshe", ["Yehoshua", "Kalev", "Korach"], "Moshe spoke for Hashem. Aharon stood with him."),
    item("p8d", 8, "The first time the Torah tells about the Ten Commandments, which book is that?", "Shemot", ["Bereishit", "Vayikra", "Bamidbar"], "The giving of the Ten Commandments is first told in Shemot. Devarim repeats them later."),
    item("p8e", 8, "Whom did Hashem name to lead the artwork of the Mishkan?", "Betzalel", ["Yehoshua", "Kalev", "Pinchas"], "Shemot names Betzalel to lead the building of the Mishkan."),
    item("p8f", 8, "Which spy, together with Kalev, said the people could enter the land?", "Yehoshua", ["Korach", "Datan", "Bilaam"], "Yehoshua and Kalev trusted Hashem's promise about the land."),

    item("p9a", 9, "Pesach remembers which event?", "Leaving Egypt", ["The flood", "Building the sukkah", "The story of Purim"], "Pesach is the holiday of leaving Egypt."),
    item("p9b", 9, "Shavuot remembers which event?", "The giving of the Torah", ["The flood", "The story of Esther", "Lighting the Chanukah menorah"], "Shavuot is the time of the giving of the Torah at Sinai."),
    item("p9c", 9, "How many days does Chanukah last?", "8", ["1", "7", "10"], "We light the Chanukah menorah for eight days."),
    item("p9d", 9, "In the Purim story, who was the Jewish queen?", "Esther", ["Ruth", "Miriam", "Sarah"], "Esther was the queen in Shushan."),
    item("p9e", 9, "On Rosh Hashanah we listen to which instrument?", "The shofar", ["A gragger", "A drum", "A flute"], "The mitzvah of the day is to hear the shofar."),
    item("p9f", 9, "Yom Kippur is mainly a day for what?", "Fasting and saying sorry", ["Building a sukkah", "Wearing costumes", "Lighting eight candles"], "Yom Kippur is the holy day of fasting and return."),

    item("p10a", 10, "What sign did Hashem set after the flood?", "A rainbow", ["A sukkah", "A menorah", "A crown"], "Bereishit says the rainbow is the sign of the promise."),
    item("p10b", 10, "How many guests did Avraham hurry to welcome by his tent?", "3", ["1", "7", "12"], "Bereishit 18 says Avraham saw three guests and ran to welcome them."),
    item("p10c", 10, "Did Moshe enter the Land of Israel?", "No", ["Yes", "Only for one Shabbat", "Only with the twelve spies"], "The Torah says Moshe would see the land but not cross into it. Yehoshua led the people in."),
    item("p10d", 10, "Who led the people into the land after Moshe?", "Yehoshua", ["Kalev", "Aharon", "Miriam"], "Yehoshua became the leader after Moshe."),
    item("p10e", 10, "A ripe etrog, ready for Sukkot, is what color?", "Yellow", ["Blue", "Black", "Purple"], "A ready etrog is yellow."),
    item("p10f", 10, "Bereishit, the first portion, begins with which words' meaning?", "In the beginning", ["Hear O Israel", "These are the names", "In the desert"], "Bereishit means in the beginning.")
  ];

  root.Q_PARSHA = items;
  if (typeof module !== "undefined" && module.exports) module.exports = items;
})(typeof globalThis !== "undefined" ? globalThis : this);
