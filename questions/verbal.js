/* Verbal: reading, vocabulary, and reasoning.
   The answer is stated in the text, or it is the only meaning that fits. */
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
    item("v1a", 1, "The cat is black. What color is the cat?", "Black", ["White", "Red", "Blue"], "The sentence says the cat is black."),
    item("v1b", 1, "The ball is in the box. Where is the ball?", "In the box", ["On the roof", "In the lake", "Under the bed"], "The sentence says the ball is in the box."),
    item("v1c", 1, "Sam likes apples. What does Sam like?", "Apples", ["Bread", "Shoes", "Pencils"], "The sentence says Sam likes apples."),
    item("v1d", 1, "The bird can fly. What can the bird do?", "Fly", ["Read", "Cook", "Drive"], "The sentence says the bird can fly."),
    item("v1e", 1, "It is night. The moon is out. What time is it in the story?", "Night", ["Morning", "Noon", "Sunset only"], "The story says it is night."),
    item("v1f", 1, "A puppy is a baby dog. What is a puppy?", "A baby dog", ["A baby cat", "A baby bird", "A baby fish"], "The sentence says a puppy is a baby dog."),

    item("v2a", 2, "Mina has a red hat and blue shoes. What color is the hat?", "Red", ["Blue", "Green", "Yellow"], "The hat is red. The shoes are blue."),
    item("v2b", 2, "The fish lives in the water. Where does the fish live?", "In the water", ["In a nest", "In the sky", "In a book"], "The sentence says the fish lives in the water."),
    item("v2c", 2, "Huge means very big. What does huge mean?", "Very big", ["Very small", "Very quiet", "Very cold"], "The sentence says huge means very big."),
    item("v2d", 2, "Leo ate breakfast, then he walked to school. What did Leo do first?", "Ate breakfast", ["Walked to school", "Went to sleep", "Flew a kite"], "Breakfast comes first. Then he walked."),
    item("v2e", 2, "The opposite of hot is cold. What is the opposite of hot?", "Cold", ["Warm", "Fast", "Loud"], "The sentence says the opposite of hot is cold."),
    item("v2f", 2, "There are three cups. One broke. How many cups are still whole?", "2", ["3", "1", "0"], "Three minus the one that broke leaves two."),

    item("v3a", 3, "The library is quiet. People whisper there. How do people talk in the library?", "They whisper", ["They shout", "They sing loudly", "They do not come in"], "The text says people whisper."),
    item("v3b", 3, "A calendar shows days and months. What does a calendar show?", "Days and months", ["Only prices", "Only maps", "Only songs"], "The sentence says days and months."),
    item("v3c", 3, "Jade planted a seed. Later a flower grew. What grew from the seed?", "A flower", ["A bicycle", "A cloud", "A shoe"], "The text says a flower grew."),
    item("v3d", 3, "Which word means a person you like to play with?", "Friend", ["Storm", "Pencil", "Window"], "A friend is a person you like to be with."),
    item("v3e", 3, "The path splits. The left path goes to the lake. The right path goes home. Which path goes to the lake?", "The left path", ["The right path", "Both paths", "Neither path"], "The text says the left path goes to the lake."),
    item("v3f", 3, "Ben read two pages. Then he read two more. How many pages did he read?", "4", ["2", "3", "6"], "Two pages and two more pages are four."),

    item("v4a", 4, "The bakery opens at 8 and closes at 2. Nora comes at 9. Is the bakery open?", "Yes", ["No", "Only on Sunday", "Only at night"], "9 is after 8 and before 2, so it is open."),
    item("v4b", 4, "Which one does not belong with apple, pear, and banana?", "Bicycle", ["Grape", "Peach", "Plum"], "The others are fruit. A bicycle is not."),
    item("v4c", 4, "Brave means ready to try something hard. What does brave mean here?", "Ready to try something hard", ["Very sleepy", "Very late", "Very small"], "The sentence gives the meaning."),
    item("v4d", 4, "The red team scored 3. The blue team scored 5. Which team scored more?", "Blue", ["Red", "They tied", "Neither team scored"], "5 is more than 3, so blue scored more."),
    item("v4e", 4, "A synonym is a word with almost the same meaning. Which word is closest to happy?", "Glad", ["Angry", "Empty", "Broken"], "Glad and happy are close in meaning."),
    item("v4f", 4, "The note says: Bring a coat. It is windy. What should you bring?", "A coat", ["A swimsuit", "A lamp", "A drum"], "The note says to bring a coat."),

    item("v5a", 5, "Owl sleeps by day and looks for food at night. When does Owl look for food?", "At night", ["At noon", "Only at dawn", "Owl does not eat"], "The sentence says Owl looks for food at night."),
    item("v5b", 5, "The puzzle has a missing corner. Which piece fits that spot?", "The corner piece", ["A round wheel", "A bottle of paint", "A pair of socks"], "A missing corner needs the corner piece."),
    item("v5c", 5, "Rare means not often seen. What does rare mean?", "Not often seen", ["Seen every day", "Very loud", "Easy to lift"], "The sentence says rare means not often seen."),
    item("v5d", 5, "Ada finished her page before the bell. The bell means the end of class. Did Ada finish during class?", "Yes", ["No", "Only after lunch", "The story does not say"], "She finished before the bell, and the bell ends class."),
    item("v5e", 5, "All of the chicks are yellow except one brown chick. How many brown chicks does the sentence name?", "One", ["None", "All of them", "Ten"], "It says one brown chick."),
    item("v5f", 5, "To prepare means to get ready. What does prepare mean?", "Get ready", ["Forget", "Hide", "Erase"], "The sentence says prepare means to get ready."),

    item("v6a", 6, "The map key says a blue line is a river and a black line is a road. What is a blue line?", "A river", ["A road", "A house", "A mountain"], "The key says a blue line is a river."),
    item("v6b", 6, "Jo promised to return the book on Tuesday. Today is Tuesday. What should Jo do with the book?", "Return it", ["Hide it", "Tear it", "Sell it"], "Jo promised to return it on Tuesday."),
    item("v6c", 6, "Which word means the top of a house?", "Roof", ["Floor", "Basement", "Sidewalk"], "The roof is the top of a house."),
    item("v6d", 6, "A square has 4 equal sides. A triangle has 3 sides. Which shape has 4 equal sides?", "A square", ["A triangle", "A circle", "A line"], "The text says a square has 4 equal sides."),
    item("v6e", 6, "The coach said, Practice is at 4, not at 5. When is practice?", "At 4", ["At 5", "At noon", "There is no practice"], "The coach said practice is at 4."),
    item("v6f", 6, "Patient means able to wait calmly. What does patient mean here?", "Able to wait calmly", ["Always running", "Never listening", "Afraid of books"], "The sentence gives that meaning."),

    item("v7a", 7, "Ruth carried water. Naomi carried bread. Who carried the water?", "Ruth", ["Naomi", "Both carried only bread", "Neither of them"], "The first sentence says Ruth carried water."),
    item("v7b", 7, "The sign shows a left arrow to the park and a right arrow to the school. Which way is the park?", "Left", ["Right", "Straight up", "Backward"], "The left arrow points to the park."),
    item("v7c", 7, "A conclusion you can check in the text: The soup was too hot, so Omar waited. Why did Omar wait?", "The soup was too hot", ["The bowl was blue", "He wanted more salt", "The story never says"], "The text says the soup was too hot, so he waited."),
    item("v7d", 7, "Which word means a short written message?", "Note", ["Ocean", "Forest", "Engine"], "A note is a short written message."),
    item("v7e", 7, "There are 10 chairs. 6 are taken. How many chairs are free?", "4", ["6", "10", "16"], "10 minus 6 is 4 free chairs."),
    item("v7f", 7, "Glance means a quick look. What does glance mean?", "A quick look", ["A long nap", "A loud shout", "A heavy bag"], "The sentence says a glance is a quick look."),

    item("v8a", 8, "Noa packed a lulav, an etrog, and a snack. She walked to her sukkah. Which holiday is she getting ready for?", "Sukkot", ["Purim", "Chanukah", "Shavuot"], "A lulav, an etrog, and a sukkah belong to Sukkot."),
    item("v8b", 8, "The library closes at 4. Ben arrived at 5. Was the library still open when Ben arrived?", "No", ["Yes", "It opens at 5", "It never closes"], "5 is after 4, so it was already closed."),
    item("v8c", 8, "Every player on the team wears blue except the goalkeeper, who wears yellow. What color does the goalkeeper wear?", "Yellow", ["Blue", "Red", "Green"], "The sentence says the goalkeeper wears yellow."),
    item("v8d", 8, "Which word means to say you are sorry?", "Apologize", ["Celebrate", "Measure", "Borrow"], "Apologize means to say you are sorry."),
    item("v8e", 8, "The recipe needs 2 cups of flour. Maya has 1 cup. How many more cups does she need?", "1", ["2", "3", "0"], "2 minus 1 is 1 more cup."),
    item("v8f", 8, "The paragraph says the trail is muddy after rain, and it rained this morning. What is the trail like now?", "Muddy", ["Dry and dusty", "Covered in snow", "Closed for the year"], "Rain makes the trail muddy, and it rained this morning."),

    item("v9a", 9, "A fable is a short story that teaches a lesson. Animals often talk in it. What is a fable?", "A short story that teaches a lesson", ["A list of prices", "A map of a city", "A song with no words"], "The sentence defines a fable."),
    item("v9b", 9, "Ido left home at 3. The walk takes 20 minutes. He wants to arrive at 3:20. Did he leave on time?", "Yes", ["No", "He left too late", "The walk takes an hour"], "A 20 minute walk from 3 arrives at 3:20."),
    item("v9c", 9, "The caption under the picture says: This is the old bridge. What is the picture of?", "The old bridge", ["A new ship", "A school bus", "A birthday cake"], "The caption names the old bridge."),
    item("v9d", 9, "Which one completes the idea: Finger is to hand as toe is to ___ ?", "Foot", ["Hat", "Cloud", "Spoon"], "A toe is part of a foot, as a finger is part of a hand."),
    item("v9e", 9, "The rules say: No running by the pool. Maya is by the pool. What should Maya not do?", "Run", ["Sit", "Talk quietly", "Wear sandals"], "The rule says no running by the pool."),
    item("v9f", 9, "Scarce means there is not enough of something. What does scarce mean?", "There is not enough", ["There is too much", "It is very sweet", "It is brand new"], "The sentence says scarce means there is not enough."),

    item("v10a", 10, "The guide wrote: Take the second left, then go straight to the blue door. What do you do first?", "Take the second left", ["Go straight", "Look for a red door", "Turn around"], "The first step is the second left."),
    item("v10b", 10, "A summary tells the main idea in a few words. Which is the best summary of this text: Rafi watered the seeds every day. After two weeks, green shoots came up.", "Rafi's seeds grew after he watered them", ["Rafi bought a hat", "The shoots were purple", "Two weeks is a year"], "The main idea is that watering led to green shoots."),
    item("v10c", 10, "Both passages say the museum is free on Sunday. Passage A adds that it closes at 3 on Sunday. What time does it close on Sunday?", "At 3", ["At noon", "It stays open all night", "The passages disagree"], "Passage A states the Sunday closing time."),
    item("v10d", 10, "Which statement must be true if every triangle has 3 sides and this shape is a triangle?", "This shape has 3 sides", ["This shape is a circle", "This shape has 8 sides", "This shape has no sides"], "If it is a triangle, it has 3 sides."),
    item("v10e", 10, "The author says the bridge is old but still safe. Which idea matches the author?", "It is old and still safe", ["It is new and unsafe", "It fell down", "Nobody uses it"], "The author says old but still safe."),
    item("v10f", 10, "Precise means exact, not vague. What does precise mean?", "Exact", ["Roughly guessed", "Very quiet", "Far away"], "The sentence says precise means exact.")
  ];

  root.Q_VERBAL = items;
  if (typeof module !== "undefined" && module.exports) module.exports = items;
})(typeof globalThis !== "undefined" ? globalThis : this);
