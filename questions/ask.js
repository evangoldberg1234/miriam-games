/* Draws one multiple-choice question. Hebrew is RTL. The speaker
   button appears only when the device has a voice for that language. */
(function () {
  function hasHebrew(text) {
    return /[\u0590-\u05FF]/.test(text || "");
  }

  function hasCyrillic(text) {
    return /[\u0400-\u04FF]/.test(text || "");
  }

  function voiceFor(lang) {
    if (!window.speechSynthesis || !lang) return null;
    var voices = window.speechSynthesis.getVoices();
    var want = String(lang).slice(0, 2).toLowerCase();
    var i;
    for (i = 0; i < voices.length; i++) {
      var code = (voices[i].lang || "").toLowerCase();
      if (code.indexOf(want) === 0) return voices[i];
    }
    return null;
  }

  function speak(text, lang) {
    try {
      if (!window.speechSynthesis || !text) return;
      var voice = voiceFor(lang);
      if (!voice) return;
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = voice.lang;
      utter.voice = voice;
      window.speechSynthesis.speak(utter);
    } catch (err) {
      /* No voice is fine. The words stay on the screen. */
    }
  }

  function decorate(el, text) {
    if (hasHebrew(text)) {
      el.classList.add("q-he");
      el.dir = "rtl";
      el.lang = "he";
    } else if (hasCyrillic(text)) {
      el.classList.add("q-ru");
      el.lang = "ru";
    }
  }

  function shuffle(list) {
    var arr = list.slice();
    var i;
    for (i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function render(parent, question, onChoice) {
    parent.innerHTML = "";
    parent.setAttribute("data-answer", question.answer);
    parent.setAttribute("data-qid", question.id);
    var prompt = document.createElement("p");
    prompt.className = "q-prompt";
    prompt.textContent = question.prompt;
    decorate(prompt, question.prompt);
    parent.appendChild(prompt);

    var hear = document.createElement("button");
    hear.type = "button";
    hear.className = "q-speak";
    hear.textContent = "Hear it";
    hear.hidden = !voiceFor(question.speakLang);
    hear.addEventListener("click", function () {
      speak(question.speak || question.prompt, question.speakLang);
    });
    parent.appendChild(hear);
    if (window.speechSynthesis && hear.hidden) {
      window.speechSynthesis.onvoiceschanged = function () {
        hear.hidden = !voiceFor(question.speakLang);
      };
    }

    var choices = document.createElement("div");
    choices.className = "q-choices";
    shuffle(question.choices).forEach(function (choice) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "q-choice";
      button.textContent = choice;
      button.setAttribute("data-choice", choice);
      decorate(button, choice);
      button.addEventListener("click", function () {
        onChoice(choice, button);
      });
      choices.appendChild(button);
    });
    parent.appendChild(choices);
    var note = document.createElement("p");
    note.className = "q-note";
    note.setAttribute("data-note", "1");
    parent.appendChild(note);
  }

  function lock(parent, choice, question, correct) {
    var buttons = parent.querySelectorAll(".q-choice");
    var i;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
      if (buttons[i].getAttribute("data-choice") === question.answer) buttons[i].classList.add("right");
      else if (buttons[i].getAttribute("data-choice") === choice) buttons[i].classList.add("wrong");
    }
    var note = parent.querySelector("[data-note]");
    if (!note) return;
    if (correct) note.textContent = "Yes! " + question.explain;
    else note.textContent = "Almost! " + question.explain;
  }

  window.Ask = { render: render, lock: lock, voiceFor: voiceFor };
})();
