/* Kid-friendly multiple-choice questions for all 54 parshiyot,
   plus holiday and general Torah questions.
   Facts are the well-known ones from the text. Nothing frightening. */
(function (root) {
  function pack(groups) {
    var out = [];
    Object.keys(groups).forEach(function (parsha) {
      groups[parsha].forEach(function (item, index) {
        var wrongs = item[3];
        out.push({
          id: parsha + "-" + (index + 1),
          parsha: parsha,
          level: item[0],
          q: item[1],
          choices: [item[2]].concat(wrongs),
          answer: item[2],
          explain: item[4]
        });
      });
    });
    return out;
  }

  /* Each item: [level, question, answer, [wrong, wrong, wrong], explain] */
  var questions = pack({
    bereshit: [
      [1, "In Bereshit, what did Hashem do on the seventh day?", "He rested", ["He made the sun", "He made the fish", "He made the trees"], "Hashem made the world in six days and rested on the seventh day. That day is Shabbat."],
      [2, "Who are the first man and woman in Bereshit?", "Adam and Chava", ["Noach and Naama", "Avraham and Sarah", "Moshe and Miriam"], "Bereshit tells about Adam and Chava, the first people."],
      [3, "How many days of creating come before the day of rest?", "Six", ["Seven", "Three", "Ten"], "There are six days of creating. The seventh day is Shabbat, the day of rest."]
    ],
    noach: [
      [1, "What did Noach build so his family and the animals could be safe?", "An ark", ["A tall tower", "A stone house", "A raft"], "Hashem told Noach to build an ark. His family and the animals went inside."],
      [2, "After the flood, what sign did Hashem put in the sky?", "A rainbow", ["A new moon", "A flock of birds", "A bright star only"], "Hashem set a rainbow in the clouds as a promise to care for the world."],
      [3, "What did the dove bring back to Noach?", "An olive leaf", ["A fish", "A bunch of grapes", "A stick from the ark"], "The dove came back with an olive leaf. That showed the water was going down."]
    ],
    "lech-lecha": [
      [1, "In Lech-Lecha, what did Hashem tell Avram to do?", "Go to a land Hashem would show him", ["Stay in his old house forever", "Build a boat", "Go down to Egypt to be king"], "Hashem said, go, and I will show you the land."],
      [2, "What new name did Avram get in this parsha?", "Avraham", ["Yitzchak", "Yaakov", "Yosef"], "Hashem changed Avram's name to Avraham."],
      [3, "What new name did Sarai get?", "Sarah", ["Rivkah", "Rachel", "Leah"], "Hashem changed Sarai's name to Sarah."]
    ],
    vayera: [
      [1, "When guests came to Avraham's tent, what did he do?", "He hurried to give them food and a place to rest", ["He told them to go away", "He hid inside the tent", "He sent them to the river"], "Avraham welcomed the guests. He brought them water and a meal."],
      [2, "What news made Sarah laugh?", "She would have a baby", ["She would move to the sea", "She would build an ark", "She would become a queen that day"], "The guest said Sarah would have a son. She laughed, because it felt surprising."],
      [3, "What is the name of Sarah's baby in Vayera?", "Yitzchak", ["Yishmael", "Yaakov", "Yosef"], "Sarah and Avraham had a son. They named him Yitzchak."]
    ],
    "chayei-sara": [
      [1, "Where did Avraham's helper meet Rivkah?", "At a well", ["On a mountain", "In a market", "By the sea"], "The helper waited by a well, and Rivkah came to draw water."],
      [2, "What kind thing did Rivkah do?", "She gave water to the helper and to the camels", ["She ran away", "She hid the water", "She sold the camels"], "Rivkah was kind. She watered the helper and all the camels."],
      [3, "Rivkah became the wife of which son of Avraham?", "Yitzchak", ["Yaakov", "Yosef", "Moshe"], "Rivkah went with the helper and became Yitzchak's wife."]
    ],
    toldot: [
      [1, "Who were the twin sons of Yitzchak and Rivkah?", "Yaakov and Esav", ["Yosef and Binyamin", "Moshe and Aharon", "Calev and Yehoshua"], "Rivkah had twins. Their names were Yaakov and Esav."],
      [2, "When Yaakov was born, what was he holding?", "Esav's heel", ["A bowl of soup", "A bow", "A lamb"], "Yaakov was born holding Esav's heel. That is why he is called Yaakov."],
      [3, "How does the parsha describe the two brothers?", "Esav knew hunting, and Yaakov stayed by the tents", ["Both brothers were sailors", "Both brothers were kings", "Yaakov hunted and Esav stayed inside"], "Esav was a hunter. Yaakov was a quiet man who stayed by the tents."]
    ],
    vayetzei: [
      [1, "What did Yaakov see in his dream?", "A ladder with angels going up and down", ["A boat on the sea", "A rainbow only", "A burning bush"], "Yaakov dreamed of a ladder reaching to heaven, with angels on it."],
      [2, "Which sister did Yaakov want to marry?", "Rachel", ["Sarah", "Rivkah", "Miriam"], "Yaakov loved Rachel and wanted to marry her."],
      [3, "Who else became Yaakov's wife in this parsha?", "Leah", ["Dinah", "Rivkah", "Chava"], "Leah became Yaakov's wife in this parsha, and Rachel did too."]
    ],
    vayishlach: [
      [1, "What new name did Yaakov receive?", "Yisrael", ["Avraham", "Yosef", "Yehuda"], "Yaakov's new name was Yisrael."],
      [2, "Which brother did Yaakov go to meet?", "Esav", ["Yosef", "Binyamin", "Aharon"], "Yaakov prepared to meet his brother Esav."],
      [3, "The name Yisrael became the name of what?", "Yaakov's family, the people of Israel", ["A river only", "A kind of bread", "A new city in Egypt"], "Yisrael is the name of Yaakov and of the family that comes from him."]
    ],
    vayeshev: [
      [1, "What special gift did Yaakov give Yosef?", "A colorful coat", ["A gold crown", "A pair of shoes", "A wooden boat"], "Yaakov gave Yosef a special colorful coat."],
      [2, "Why were the brothers upset with Yosef?", "They were jealous of him", ["He lost their sheep", "He forgot their names", "He broke the coat"], "The brothers saw that Yaakov loved Yosef, and they felt jealous."],
      [3, "Where was Yosef taken?", "To Egypt", ["To the sea", "Back to Avraham's tent", "To Mount Sinai"], "Yosef was brought down to Egypt."]
    ],
    miketz: [
      [1, "What dream did Pharaoh have?", "Seven fat cows and seven thin cows", ["A ladder of angels", "A talking donkey", "A rainbow"], "Pharaoh dreamed about seven fat cows and seven thin cows."],
      [2, "Who explained Pharaoh's dream?", "Yosef", ["Esav", "The baker", "Bilam"], "Yosef explained the dream. He said Hashem was showing what would happen."],
      [3, "What did the seven fat cows stand for?", "Seven good years of food", ["Seven days of Shabbat", "Seven sons", "Seven rivers"], "Yosef said there would be seven good years, and then seven hard years."]
    ],
    vayigash: [
      [1, "What did Yosef tell his brothers when he could not hide anymore?", "I am Yosef", ["I am Pharaoh", "I am Esav", "I am a stranger"], "Yosef said, I am Yosef. Is my father still alive?"],
      [2, "Yosef hugged which younger brother?", "Binyamin", ["Esav", "Reuven", "Yehuda only from far away"], "Yosef hugged his brother Binyamin and cried."],
      [3, "Where did Yaakov's family go to live?", "Egypt", ["Canaan only, and they never left", "Babylon", "The desert by Sinai"], "Yosef brought his father and his family to live in Egypt."]
    ],
    vayechi: [
      [1, "Before he died, Yaakov blessed which group?", "His twelve sons", ["Only Yosef", "The people of Egypt", "Pharaoh's helpers"], "Yaakov blessed his twelve sons, each with his own words."],
      [2, "Where did Yaakov ask to be buried?", "In the land of Canaan, with his family", ["In Pharaoh's palace", "At the sea", "In a new city"], "Yaakov asked to be buried in Canaan, in the family burial place."],
      [3, "What promise did Yosef remind his brothers about?", "Hashem would bring them back to their land", ["They would stay in Egypt forever", "They would build a tower", "They would forget the family"], "Yosef said Hashem would remember them and bring them up from Egypt."]
    ],
    shemot: [
      [1, "Where did baby Moshe ride on the river?", "In a basket", ["In a wooden cart", "On a camel", "In a big ship"], "Moshe's mother put him in a basket on the river so he would be safe."],
      [2, "Who found the baby?", "Pharaoh's daughter", ["Sarah", "Rivkah", "A fisherman"], "Pharaoh's daughter found the basket and cared for the baby."],
      [3, "What was special about the bush Moshe saw?", "It burned but it was not used up", ["It was made of gold", "It walked toward him", "It grew grapes"], "The bush was on fire, but the fire did not burn it up. Hashem spoke from it."],
      [1, "Who went with Moshe to help him speak?", "Aharon", ["Yosef", "Pharaoh", "Esav"], "Aharon was Moshe's brother. He helped Moshe speak."]
    ],
    vaera: [
      [1, "Hashem sent Moshe to tell Pharaoh to let the people do what?", "Leave Egypt", ["Build a bigger palace", "Stay forever", "Forget Shabbat"], "Hashem said the people should go out of Egypt."],
      [2, "Who did Moshe and Aharon speak to?", "Pharaoh", ["Avraham", "Yosef", "Bilam"], "Moshe and Aharon went to Pharaoh with Hashem's message."],
      [3, "Which sign in this parsha filled the houses and the river?", "Frogs", ["Snow", "Olive leaves", "Ladders"], "Hashem sent frogs as a sign so Pharaoh would listen."]
    ],
    bo: [
      [1, "Why was the bread flat when the people left Egypt?", "They left quickly, so it had no time to rise", ["They forgot the water", "The oven was too big", "They wanted soup instead"], "They hurried out. The dough did not rise. That flat bread is matzah."],
      [2, "Which holiday remembers the leaving of Egypt?", "Pesach", ["Chanukah", "Purim", "Shavuot only"], "Pesach remembers the day Hashem took the people out of Egypt."],
      [3, "In Bo, the people finally get to do what?", "Leave Egypt", ["Return to the ark", "Build the Mishkan", "Cross the Jordan"], "After the signs, Pharaoh told them to go, and they left Egypt."]
    ],
    beshalach: [
      [1, "How did the people cross the sea?", "Hashem split the sea and they walked through", ["They swam all night", "They went around for a year", "A bridge of boats was waiting"], "Hashem split the sea. The people walked across on dry ground."],
      [2, "What food did Hashem send from the sky?", "Manna", ["Olives", "Fish", "Bread from Egypt"], "Each morning the people found manna, food Hashem sent."],
      [3, "What happened with manna on Shabbat?", "None fell on Shabbat. A double amount fell on Friday", ["It fell only on Shabbat", "It turned into water", "The people had to cook a new kind"], "On Friday they gathered for two days, so they could rest on Shabbat."]
    ],
    yitro: [
      [1, "Who was Moshe's father-in-law?", "Yitro", ["Pharaoh", "Bilam", "Korach"], "Yitro, Moshe's father-in-law, came to visit him."],
      [2, "How many commandments did Hashem speak at Sinai?", "Ten", ["Two", "Seven", "Forty"], "At Mount Sinai, Hashem gave the Ten Commandments."],
      [3, "Where did Hashem give the Ten Commandments?", "Mount Sinai", ["The Nile river", "Yaakov's ladder", "Pharaoh's palace"], "The people stood by Mount Sinai when Hashem spoke the commandments."]
    ],
    mishpatim: [
      [1, "Mishpatim says to be kind to a stranger. Why?", "Because the people were strangers in Egypt", ["Because strangers bring gold", "Because there are no neighbors", "Because the sea is salty"], "The Torah says you know how it feels to be a stranger, so you must be kind."],
      [2, "What kind of rules are in Mishpatim?", "Fair rules for how people treat each other", ["Rules for building a boat", "A list of kings", "Songs only"], "Mishpatim teaches fair rules for everyday life."],
      [3, "If you find a lost animal, even one that belongs to someone you do not like, what should you do?", "Bring it back", ["Keep it", "Hide it", "Send it into the sea"], "The Torah says to return a lost animal, even an enemy's animal."]
    ],
    terumah: [
      [1, "What special place does Terumah tell the people to make?", "The Mishkan", ["Noach's ark", "A palace for Pharaoh", "A tower"], "Terumah gives the command and the plan for the Mishkan. The building itself is told later, in Vayakhel."],
      [2, "What was the Aron, the ark, for?", "It held the tablets", ["It held food for the camels", "It was a drum", "It was Pharaoh's chair"], "The Aron was a special box for the tablets."],
      [3, "Terumah says the gifts for the Mishkan should come from whom?", "People whose hearts want to give", ["People who find them in the sea", "A king who sells them", "Trees in the camp"], "Hashem says to take a gift from every person whose heart moves them. The people actually bring those gifts in Vayakhel."]
    ],
    tetzaveh: [
      [1, "Who was the first kohen gadol, the high priest?", "Aharon", ["Pharaoh", "Bilam", "Esav"], "Aharon, Moshe's brother, was the first kohen gadol."],
      [2, "The ner tamid, the lamp that stays lit, uses what?", "Olive oil", ["Sea water", "Honey", "Milk"], "The lamp in the Mishkan was lit with pure olive oil."],
      [3, "Aharon's sons also served as what?", "Kohanim, priests", ["Kings of Egypt", "Spies", "Sailors"], "Aharon and his sons served as the kohanim."]
    ],
    "ki-tisa": [
      [1, "How does Ki Tisa tell us to spend the week?", "Six days of work, and Shabbat for rest", ["Work every day", "Rest on day three only", "Build all through Shabbat"], "Six days you work. On the seventh day you rest."],
      [2, "The people made a golden calf. What was that?", "A big mistake, and Moshe asked Hashem to forgive them", ["A gift Hashem had asked for", "The Aron", "A new fruit"], "The calf was a mistake. Moshe prayed, and Hashem stayed with the people."],
      [3, "How many tablets did Moshe bring?", "Two", ["Ten tablets", "One tiny stone", "Seven tablets"], "The Ten Commandments were written on two tablets."]
    ],
    vayakhel: [
      [1, "What did Moshe remind the people about before they built?", "Keep Shabbat", ["Forget the Mishkan", "Leave the camp", "Stop giving water"], "Moshe gathered the people and told them to keep Shabbat, and then to build."],
      [2, "Who led the building work?", "Betzalel", ["Pharaoh", "Bilam", "Esav"], "Betzalel was filled with wisdom to lead the work of the Mishkan."],
      [3, "The people brought so many gifts that Moshe said what?", "Stop. We have enough", ["Bring even more gold tomorrow", "Take the gifts back", "Sell the gifts"], "The gifts were more than enough, so Moshe asked the people to stop bringing them."]
    ],
    pekudei: [
      [1, "What covered the Mishkan to show Hashem's presence?", "A cloud", ["A rainbow only", "A flock of doves", "Snow"], "A cloud rested on the Mishkan. That showed Hashem was with them."],
      [2, "Who counted the materials of the Mishkan in Pekudei?", "The Levites, under Itamar", ["The fish in the sea", "The stars", "Pharaoh's horses"], "The count was at Moshe's command. The Levites did the counting, under Itamar, Aharon's son."],
      [3, "Who set up the Mishkan when the work was finished?", "Moshe", ["Pharaoh", "Yitro", "Korach"], "Moshe set up the Mishkan, just as Hashem had said."]
    ],
    vayikra: [
      [1, "What does the word Vayikra mean?", "And He called", ["And he ran", "And he sang", "And he built"], "Vayikra means And He called. Hashem called to Moshe."],
      [2, "Who did Hashem call at the start of this book?", "Moshe", ["Pharaoh", "Bilam", "Noach"], "Hashem called Moshe from the Mishkan."],
      [3, "Offerings at the Mishkan helped the people do what?", "Feel close to Hashem and say thank you", ["Forget Shabbat", "Leave the Torah", "Hide from the kohanim"], "A person could bring an offering to feel close to Hashem and to say thank you."]
    ],
    tzav: [
      [1, "What stayed burning on the mizbeach, the altar?", "A fire", ["A bowl of water", "A rainbow", "A pile of snow"], "The fire on the altar was kept going. It was not put out."],
      [2, "The kohanim come from whose family?", "Aharon's family", ["Pharaoh's family", "Bilam's family", "Esav's family"], "The kohanim are from Aharon and his sons."],
      [3, "A korban, an offering, can be a way to say what?", "Thank you", ["Goodbye forever", "I will not come back", "I forgot the mitzvah"], "Some offerings were a way to say thank you to Hashem."]
    ],
    shmini: [
      [1, "A kosher land animal must do which two things?", "Chew its cud and have split hooves", ["Fly and swim", "Have fins and live in a tree", "Roar and have a mane"], "The Torah says a kosher land animal chews its cud and has split hooves."],
      [2, "Why is a pig not kosher?", "It has split hooves but does not chew its cud", ["It is too small", "It lives by water", "It has fins"], "Both signs are needed. A pig has only one of them."],
      [3, "A kosher fish needs what?", "Fins and scales", ["Legs and fur", "A shell only", "Wings"], "Fish that have fins and scales are kosher."],
      [1, "In Shmini, who began the service of the Mishkan?", "Aharon", ["Pharaoh", "Bilam", "Korach"], "Aharon began to serve as kohen gadol in the Mishkan."]
    ],
    tazria: [
      [1, "On which day does the Torah say a baby boy has a brit milah?", "The eighth day", ["The first day", "The thirtieth day", "The day he turns three"], "The Torah says the brit milah is on the eighth day."],
      [2, "If someone had a mark on the skin, who examined it?", "A kohen", ["A king of Egypt", "A hunter", "A sailor"], "The kohen examined the mark and told the person what to do."],
      [3, "The rules about a skin mark were there so the camp could do what?", "Stay cared for and know when someone was well", ["Forget the person", "Send every person away forever", "Close the Mishkan"], "The kohen checked the mark so people knew when it was time to return."]
    ],
    metzora: [
      [1, "When the kohen said a person was well, what could that person do?", "Rejoin the camp", ["Leave the Torah", "Become the king", "Stay outside forever"], "When the person was well, the kohen said they could come back."],
      [2, "The kohen also checked marks on what?", "A house", ["A cloud", "A rainbow", "The sea"], "Sometimes a mark showed up on a house, and the kohen checked that too."],
      [3, "What is the happy idea in Metzora?", "People can heal and come back", ["People must hide", "Houses can never be used", "The camp stays closed"], "Healing is possible. A person who is well returns to the community."]
    ],
    "achrei-mot": [
      [1, "Which holy day is the main day in Achrei Mot?", "Yom Kippur", ["Purim", "Chanukah", "Pesach only"], "Achrei Mot teaches about Yom Kippur, the day of coming close to Hashem."],
      [2, "On Yom Kippur, what do we try to do?", "Say sorry and start fresh", ["Build a sukkah", "Read the Esther story only", "Plant a new field"], "Yom Kippur is a day to say sorry and begin again."],
      [3, "Who did the special service on that day?", "The kohen gadol", ["Pharaoh", "A spy", "The king of Moav"], "The kohen gadol served in a special way on Yom Kippur."]
    ],
    kedoshim: [
      [1, "Which famous words are in Kedoshim?", "Love your neighbor as yourself", ["Build a tall tower", "Forget the stranger", "Hunt every day"], "The Torah says, love your neighbor as yourself."],
      [2, "What does Kedoshim mean?", "Holy ones", ["Hunters", "Sailors", "Builders only"], "Hashem says the people should be holy."],
      [3, "Kedoshim says weights in the market must be what?", "Honest", ["Hidden", "Extra heavy on purpose", "Different every hour"], "Use honest weights and honest measures. Do not cheat."]
    ],
    emor: [
      [1, "Emor lists the special days of the year. A sukkah belongs to which holiday?", "Sukkot", ["Purim", "Chanukah", "Shavuot only"], "On Sukkot we sit in a sukkah. Emor lists that holiday."],
      [2, "Emor says the sukkah helps us remember what?", "Hashem brought the people out of Egypt", ["Yom Kippur", "A market day", "Shabbat only"], "Emor says the people should know that Hashem brought them out of Egypt and had them live in sukkot."],
      [3, "Emor teaches that the holidays are days to do what?", "Come close to Hashem together", ["Forget the calendar", "Work extra hours", "Stay silent all year"], "The holidays are meeting times with Hashem."]
    ],
    behar: [
      [1, "In the seventh year, what does the land do?", "It rests", ["It is sold to Egypt", "It is planted day and night", "It becomes a sea"], "The seventh year is shmita. The land rests."],
      [2, "What is the fiftieth year called?", "Yovel", ["Pesach", "Purim", "Chanukah"], "After seven groups of years, the fiftieth year is the Yovel."],
      [3, "Behar teaches the land really belongs to whom?", "Hashem", ["Pharaoh", "The highest bidder only", "No one, so rules do not matter"], "The land is Hashem's. We use it with care and let it rest."]
    ],
    bechukotai: [
      [1, "If the people follow Hashem, Bechukotai says the rain will come how?", "In its right time", ["Never", "Only at night once a year", "As snow in the desert every day"], "One blessing is rain at the right time, so the land can grow food."],
      [2, "The blessings in this parsha are for people who do what?", "Follow Hashem's ways", ["Forget the mitzvot", "Leave the land empty of kindness", "Ignore Shabbat"], "Hashem promises care and blessing when the people walk in the mitzvot."],
      [3, "A land that gets rain in its time can grow what?", "Food", ["Only stones", "Salt", "Nothing at all"], "Rain in its time helps the fields grow food for the people."]
    ],
    bamidbar: [
      [1, "What does Bamidbar mean?", "In the desert", ["By the sea", "On the mountain", "In Egypt"], "Bamidbar means in the desert. That is where the people were camped."],
      [2, "What did Moshe do with the people in this parsha?", "He counted them", ["He sent them back to Egypt", "He built boats", "He closed the camp"], "Hashem told Moshe to count the people."],
      [3, "How did the families camp?", "Around the Mishkan, each group with its flag", ["In one long line with no order", "Inside the Aron", "Far from the Mishkan, with no flags"], "The camps sat around the Mishkan. Each group had its own flag."]
    ],
    nasso: [
      [1, "The Birkat Kohanim begins with which words?", "May Hashem bless you and keep you", ["Go back to Egypt", "Build a golden calf", "Forget your neighbor"], "The kohanim say, May Hashem bless you and keep you."],
      [2, "Who says this blessing?", "The kohanim", ["Pharaoh", "Bilam", "The spies"], "Hashem told the kohanim to bless the people with these words."],
      [3, "The blessing asks Hashem to do what?", "Bless the people and give them peace", ["Send them away", "Hide from them", "Make them forget the Torah"], "The priestly blessing ends by asking Hashem for peace."]
    ],
    behaalotecha: [
      [1, "What did Aharon light in this parsha?", "The menorah", ["A bonfire on the sea", "Pharaoh's palace", "A rainbow"], "Aharon lit the lamps of the menorah."],
      [2, "What showed the people when to travel?", "The cloud, and the silver trumpets", ["A talking donkey", "The moon only", "Birds"], "When the cloud lifted, they traveled. The trumpets called them too."],
      [3, "The cloud resting on the Mishkan meant what?", "Hashem was with the people", ["It was time to go back to Egypt", "The Mishkan was empty", "Shabbat was canceled"], "The cloud was a sign that Hashem's presence was there."]
    ],
    shlach: [
      [1, "How many spies went to see the land?", "Twelve", ["Two", "Seven", "Forty"], "Moshe sent twelve spies, one from each tribe."],
      [2, "Which two spies trusted Hashem?", "Yehoshua and Calev", ["Bilam and Balak", "Korach and Datan", "Pharaoh and his helper"], "Yehoshua and Calev said, Hashem can bring us into the land."],
      [3, "What huge fruit did the spies carry back?", "Grapes", ["Olives the size of a house", "A pumpkin", "Apples from Sinai"], "They carried a cluster of grapes so big that two people held the pole."]
    ],
    korach: [
      [1, "What did Korach do?", "He argued with Moshe about who should lead", ["He built the ark", "He blessed the people", "He lit the menorah"], "Korach argued with Moshe and Aharon about leadership."],
      [2, "What happened to Aharon's staff?", "It sprouted flowers and almonds", ["It sank in the sea", "It broke", "It became a trumpet"], "Aharon's staff budded, flowered, and grew almonds. That showed Hashem had chosen him."],
      [3, "The almonds on Aharon's staff showed what?", "Hashem chose Aharon to serve as kohen", ["Korach should be king", "The people should stop Shabbat", "The staff was only a walking stick"], "Hashem made Aharon's staff blossom so everyone could see his choice."]
    ],
    chukat: [
      [1, "Our Sages teach that a special well traveled with the people. In whose merit?", "Miriam", ["Pharaoh", "Bilam", "Esav"], "Our Sages teach that a well of water went with the people in Miriam's merit. The Torah tells us that after Miriam died, the people had no water."],
      [2, "What did Hashem tell Moshe to do at the rock?", "Speak to the rock", ["Hit the sea", "Build a new ark", "Leave the people"], "Hashem told Moshe to speak to the rock so it would give water."],
      [3, "Water from the rock was there so the people could do what?", "Drink", ["Build a boat", "Fill the Aron", "Put out the menorah forever"], "The people and their animals needed water to drink."]
    ],
    balak: [
      [1, "Who spoke to Bilam on the road?", "His donkey", ["A camel", "Pharaoh", "A spy"], "Hashem opened the donkey's mouth, and she spoke to Bilam."],
      [2, "What did Balak want Bilam to say about the people?", "Unkind words", ["A blessing only", "The Ten Commandments", "A bedtime song"], "Balak wanted Bilam to speak against the people of Israel."],
      [3, "What did Bilam say instead?", "How good are your tents, Yaakov", ["Go back to Egypt", "The tents are empty", "Forget the Torah"], "Hashem put a blessing in Bilam's mouth: How good are your tents, Yaakov."]
    ],
    pinchas: [
      [1, "What did the daughters of Tzelofechad ask for?", "A share of the land for their family", ["A golden calf", "A ship", "To be spies"], "Their father had died, and they asked for the family's share of the land."],
      [2, "What did Hashem answer them?", "Yes. They should receive a share", ["No. Go away", "Only a king can own land", "Ask again in Egypt"], "Hashem told Moshe that the daughters were right and should get a share."],
      [3, "Who did Hashem choose to lead after Moshe?", "Yehoshua", ["Bilam", "Korach", "Balak"], "Hashem told Moshe to place his hands on Yehoshua, the next leader."]
    ],
    matot: [
      [1, "Reuven and Gad wanted to live on which side of the Jordan?", "The east side", ["Across the sea", "In Egypt", "On a mountain in Sinai"], "They had many animals and asked to settle east of the Jordan."],
      [2, "What did they promise the other tribes?", "We will help you get your land first", ["We will not help", "We will go back to Egypt", "We will hide"], "They promised to go and help the others before they settled down."],
      [3, "Matot teaches that when you make a promise you should do what?", "Keep your word", ["Forget it", "Change it in secret", "Let someone else worry"], "They made a promise to help, and they were expected to keep it."]
    ],
    masei: [
      [1, "What does Masei mean?", "Journeys", ["Songs", "Judges", "Gates"], "Masei means the journeys of the people."],
      [2, "How many stops does the Torah list on the way?", "42", ["7", "10", "12"], "The Torah lists 42 places where the people camped."],
      [3, "A city of refuge was a place to do what?", "Be safe and get a fair hearing after an accident", ["Hide from Shabbat", "Store the manna", "Crown a king"], "If someone hurt a person by accident, the city kept them safe while the case was heard fairly."]
    ],
    devarim: [
      [1, "What does Devarim mean?", "Words", ["Journeys", "Holy ones", "In the desert"], "Devarim means words. These are the words Moshe spoke."],
      [2, "What did Moshe do in this parsha?", "He retold the story of the journey", ["He built a new ark", "He met Pharaoh again", "He counted the stars"], "Moshe began to retell what the people had lived through."],
      [3, "Devarim is which book of the Torah?", "The fifth book", ["The first book", "The second book", "A book of the Prophets"], "Devarim is the fifth and last book of the Torah."]
    ],
    vaetchanan: [
      [1, "What does the word Shema tell us to do?", "Listen", ["Run", "Build", "Forget"], "Shema means listen, or hear. Shema Yisrael, listen Israel."],
      [2, "Which commandments are said again in Vaetchanan?", "The Ten Commandments", ["Only the rules of the ark", "The list of 42 stops", "The names of the spies only"], "Moshe repeats the Ten Commandments for the people."],
      [3, "The Shema says to love Hashem with what?", "All your heart", ["Only your gold", "A loud drum", "Half a heart"], "Love Hashem with all your heart, all your soul, and all your might."]
    ],
    eikev: [
      [1, "What does Eikev say to do after you eat and feel full?", "Thank Hashem", ["Forget the meal", "Leave the table sadly", "Hide the food"], "When you have eaten and are full, thank Hashem for the good land."],
      [2, "The seven kinds of food in the land include which sweet one?", "Honey", ["Salt", "Water only", "Sand"], "The special foods include wheat, barley, grapes, figs, pomegranates, olives, and honey."],
      [3, "Eikev says Hashem cared for the people in the desert by giving what?", "Food and clothes that did not wear out", ["A palace", "Ships", "A map of Egypt"], "Their clothes did not wear out, and they had manna to eat."]
    ],
    reeh: [
      [1, "What does Re'eh mean?", "See", ["Hear", "Journey", "Count"], "Re'eh means see. Moshe says, see, I set before you a blessing and a curse."],
      [2, "What does Moshe set before the people at the start of Re'eh?", "A blessing and a curse", ["Only a curse", "A map of the sea", "A golden calf"], "Re'eh says, See, I set before you a blessing and a curse."],
      [3, "Which holiday of booths is named among the festivals?", "Sukkot", ["Purim", "Chanukah", "A new holiday with no name"], "Re'eh tells about Pesach, Shavuot, and Sukkot."]
    ],
    shoftim: [
      [1, "What does Shoftim mean?", "Judges", ["Songs", "Tents", "Clouds"], "Shoftim means judges."],
      [2, "What must a judge do?", "Be fair", ["Help only friends", "Take gifts to change the answer", "Ignore the case"], "A judge must not twist justice. Pursue what is fair."],
      [3, "A king of Israel must write for himself what?", "A copy of the Torah", ["A book of wars only", "Pharaoh's laws", "A list of ships"], "The king writes his own copy of the Torah and reads it all his life."]
    ],
    "ki-teitzei": [
      [1, "If you see something your neighbor lost, what should you do?", "Return it", ["Keep it", "Hide it", "Sell it"], "The Torah says to return a lost animal or a lost object."],
      [2, "If you see your neighbor's animal fallen on the road, what should you do?", "Help it get up", ["Walk away", "Add more weight", "Send it to the sea"], "Ki Teitzei says not to hide from an animal that has fallen on the road. Help it up."],
      [3, "Ki Teitzei is full of mitzvot about what?", "Everyday kindness and fairness", ["Building the ark", "The ten plagues", "The dreams of Pharaoh"], "This parsha teaches many everyday ways to be fair and kind."]
    ],
    "ki-tavo": [
      [1, "What are bikkurim?", "The first fruits, brought in a basket", ["The last snow", "A kind of drum", "A lost sheep"], "Farmers put the first fruits in a basket and brought them to Hashem."],
      [2, "When they brought the basket, what did they say?", "Thank you to Hashem for the land", ["We want to go back to Egypt", "The land is empty", "We forgot the story"], "They told the story of the family and thanked Hashem for the land and the fruit."],
      [3, "The first fruits came from what?", "The land Hashem gave them", ["The sea only", "Egypt's palace", "The ark"], "The fruit grew in the land, and the first of it was a gift of thanks."]
    ],
    nitzavim: [
      [1, "What does Nitzavim mean?", "Standing", ["Running", "Sleeping", "Sailing"], "Nitzavim means you are standing. The people stood together."],
      [2, "Who stood there with the grown-ups?", "The children too", ["Only the king", "Only Moshe", "No one else"], "Moshe said everyone stood there, from the leaders to the small children."],
      [3, "The Torah is described as what?", "Close to you, not too hard and far away", ["Hidden across the sea where no one can reach it", "Only for angels", "Too heavy to learn"], "The Torah is not in heaven or across the sea. It is very close to you."]
    ],
    vayelech: [
      [1, "How old was Moshe in Vayelech?", "120", ["40", "70", "10"], "Moshe said, I am 120 years old today."],
      [2, "Who would lead the people next?", "Yehoshua", ["Bilam", "Korach", "Pharaoh"], "Yehoshua would go with the people into the land."],
      [3, "What did Moshe write?", "The Torah", ["A letter to Pharaoh", "A book of ships", "The dreams of Yosef only"], "Moshe wrote this Torah and gave it to the people to keep and read."]
    ],
    haazinu: [
      [1, "What does Ha'azinu mean?", "Listen", ["Build", "Count", "Journey"], "Ha'azinu means listen. Moshe called heaven and earth to listen."],
      [2, "What did Moshe teach the people in this parsha?", "A song", ["A new map of Egypt", "How to build an ark", "The names of the cows"], "Moshe spoke a song so the people would remember Hashem's care."],
      [3, "Who did Moshe call to listen to the song?", "The heavens and the earth", ["Only Pharaoh", "Only the fish", "Only the spies"], "He said, listen, heavens, and let the earth hear."]
    ],
    "vzot-haberachah": [
      [1, "When do we read V'Zot HaBerachah?", "On Simchat Torah", ["On Purim", "On Tisha B'Av", "On Shmini Atzeret Shabbat"], "In the diaspora, V'Zot HaBerachah is read on Simchat Torah, the day after Shmini Atzeret. The Shabbat reading is the holiday portion in Devarim."],
      [2, "What did Moshe do for the tribes in this parsha?", "He blessed them", ["He sent them back to Egypt", "He counted only the animals", "He closed the book forever"], "Moshe blessed the tribes. We read this on Simchat Torah, the day after Shmini Atzeret."],
      [3, "What did Moshe see at the end?", "The land, from far away", ["The sea splitting again", "A new golden calf", "Egypt's palace"], "Hashem showed Moshe the land. We read this on Simchat Torah, then start the Torah again."]
    ],
    "rosh-hashanah": [
      [1, "What do we blow on Rosh Hashanah?", "A shofar", ["A silver trumpet from the Mishkan only", "A drum", "A flute"], "On Rosh Hashanah we hear the shofar."],
      [2, "Rosh Hashanah is the start of what?", "The Jewish year", ["Pesach", "The week of Chanukah", "Shabbat only"], "Rosh Hashanah is the new year. We ask Hashem for a good year."],
      [3, "The sound of the shofar helps us do what?", "Wake up and come close to Hashem", ["Forget the day", "Start a race", "Call the animals"], "The shofar is a wake-up call for the new year."]
    ],
    "yom-kippur": [
      [1, "Yom Kippur is a day to do what?", "Say sorry and start fresh", ["Build a sukkah", "Read the megillah", "Plant trees only"], "On Yom Kippur we say sorry to Hashem and to people."],
      [2, "A good thing to do before Yom Kippur is what?", "Ask a person you hurt to forgive you", ["Hide from your family", "Forget every promise", "Skip the prayers"], "We try to make up with people, not only say words."],
      [3, "The day is about coming back. Come back to whom?", "Hashem", ["Egypt", "A far mountain with no path", "No one"], "Teshuvah means coming back. Hashem wants us close."]
    ],
    sukkot: [
      [1, "On Sukkot, where do we eat and sit?", "In a sukkah", ["In a cave only", "On a boat", "Inside the Aron"], "A sukkah is a hut. We sit there on Sukkot."],
      [2, "Which two plants do we hold with the myrtle and the willow?", "A lulav and an etrog", ["A shofar and a dreidel", "Matzah and maror", "A menorah and a candle only"], "We hold the lulav and the etrog, together with myrtle and willow."],
      [3, "Our Sages teach that the sukkah can remind us of what?", "Clouds of glory that sheltered the people", ["The palace of Pharaoh", "The ark of Noach only", "A market day"], "The Torah says the people lived in sukkot when they left Egypt. Our Sages teach that those sukkot were clouds of glory."]
    ],
    "shmini-atzeret": [
      [1, "Shmini Atzeret comes at the end of which holiday?", "Sukkot", ["Pesach", "Purim", "Chanukah"], "After the days of Sukkot comes Shmini Atzeret, a special extra day."],
      [2, "On Shmini Atzeret we begin to pray for what?", "Rain", ["Snow in the sukkah", "A new sea", "More frogs"], "We pray for rain in its time, so the land can drink."],
      [3, "In the diaspora, the next day is Simchat Torah. What do we do then?", "Dance with the Torah and start it again", ["Blow the shofar all night", "Build Noach's ark", "Close the Torah for a year"], "On Shmini Atzeret Shabbat the reading is the holiday portion in Devarim. The next day, Simchat Torah, we read V'Zot HaBerachah, dance, and start the Torah again."]
    ],
    pesach: [
      [1, "What special bread do we eat on Pesach?", "Matzah", ["Challah with raisins only", "Cake", "Bread that rose all day"], "Matzah is flat bread. It reminds us that the people left Egypt quickly."],
      [2, "Pesach remembers what?", "Leaving Egypt", ["Building the Mishkan only", "The rainbow", "The twelve spies"], "On Pesach we tell how Hashem took us out of Egypt."],
      [3, "At the seder we do what?", "Tell the story", ["Stay silent", "Forget the past", "Only count the stars"], "We tell the story so children can hear it and ask questions."]
    ],
    shavuot: [
      [1, "What do we remember on Shavuot?", "Hashem giving the Torah", ["Noach's rainbow only", "The golden calf", "A harvest of fish"], "Shavuot is the day of the giving of the Torah at Sinai."],
      [2, "Shavuot comes after we count seven weeks from when?", "Pesach", ["Chanukah", "Purim", "Yom Kippur"], "We count seven weeks from Pesach, and then it is Shavuot."],
      [3, "On the first day of Shavuot, the Torah reading is what?", "The Ten Commandments", ["The story of the golden calf only", "A list of ships", "Pharaoh's dream only"], "The Torah reading for the first day of Shavuot is the giving of the Ten Commandments at Sinai."]
    ],
    general: [
      [1, "How many books are in the Torah?", "Five", ["One", "Twelve", "Twenty-four"], "The Torah has five books: Bereshit, Shemot, Vayikra, Bamidbar, and Devarim."],
      [1, "What is the first book of the Torah?", "Bereshit", ["Devarim", "Esther", "Tehillim"], "We start at the very beginning, in Bereshit."],
      [2, "The Torah is written in which language?", "Hebrew", ["English", "Russian", "Greek"], "The holy Torah is written in Hebrew."],
      [2, "How many tribes came from Yaakov's sons?", "Twelve", ["Two", "Seven", "Forty"], "Yaakov had twelve sons, and they became the twelve tribes."],
      [1, "Shabbat is which day?", "The seventh day", ["The first day", "The third day", "A different day each week"], "Shabbat is the seventh day, the day of rest."],
      [2, "How many nights do we light candles on Chanukah?", "Eight", ["One", "Three", "Forty"], "Chanukah lasts eight nights. We add a light each night."],
      [2, "On Purim we read the story of whom?", "Esther", ["Noach", "Bilam", "Pharaoh"], "The megillah tells how Esther helped save the Jewish people."],
      [3, "On Simchat Torah we do what with the Torah?", "Finish it and start it again", ["Close it for a year", "Bury it", "Send it away"], "We read the last parsha, dance, and begin again at Bereshit."]
    ]
  });

  root.BB_PARSHA_QUESTIONS = questions;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = questions;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
