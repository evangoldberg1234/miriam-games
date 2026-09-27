/* Diaspora weekly readings for 5787 and 5788, plus the weeks on either side.
   Dates come from Hebcal. A holiday Shabbat has no regular parsha. */
(function (root) {
  var schedule = [
  {
    "date": "2026-09-05",
    "kind": "parsha",
    "ids": [
      "nitzavim",
      "vayelech"
    ],
    "title": "Nitzavim / Vayelech"
  },
  {
    "date": "2026-09-12",
    "kind": "holiday",
    "ids": [
      "rosh-hashanah"
    ],
    "title": "Rosh Hashanah"
  },
  {
    "date": "2026-09-19",
    "kind": "parsha",
    "ids": [
      "haazinu"
    ],
    "title": "Ha'azinu"
  },
  {
    "date": "2026-09-26",
    "kind": "holiday",
    "ids": [
      "sukkot"
    ],
    "title": "Sukkot"
  },
  {
    "date": "2026-10-03",
    "kind": "holiday",
    "ids": [
      "shmini-atzeret",
      "vzot-haberachah"
    ],
    "title": "Shmini Atzeret. V'Zot HaBerachah is read the next day, on Simchat Torah"
  },
  {
    "date": "2026-10-10",
    "kind": "parsha",
    "ids": [
      "bereshit"
    ],
    "title": "Bereshit"
  },
  {
    "date": "2026-10-17",
    "kind": "parsha",
    "ids": [
      "noach"
    ],
    "title": "Noach"
  },
  {
    "date": "2026-10-24",
    "kind": "parsha",
    "ids": [
      "lech-lecha"
    ],
    "title": "Lech-Lecha"
  },
  {
    "date": "2026-10-31",
    "kind": "parsha",
    "ids": [
      "vayera"
    ],
    "title": "Vayera"
  },
  {
    "date": "2026-11-07",
    "kind": "parsha",
    "ids": [
      "chayei-sara"
    ],
    "title": "Chayei Sara"
  },
  {
    "date": "2026-11-14",
    "kind": "parsha",
    "ids": [
      "toldot"
    ],
    "title": "Toldot"
  },
  {
    "date": "2026-11-21",
    "kind": "parsha",
    "ids": [
      "vayetzei"
    ],
    "title": "Vayetzei"
  },
  {
    "date": "2026-11-28",
    "kind": "parsha",
    "ids": [
      "vayishlach"
    ],
    "title": "Vayishlach"
  },
  {
    "date": "2026-12-05",
    "kind": "parsha",
    "ids": [
      "vayeshev"
    ],
    "title": "Vayeshev"
  },
  {
    "date": "2026-12-12",
    "kind": "parsha",
    "ids": [
      "miketz"
    ],
    "title": "Miketz"
  },
  {
    "date": "2026-12-19",
    "kind": "parsha",
    "ids": [
      "vayigash"
    ],
    "title": "Vayigash"
  },
  {
    "date": "2026-12-26",
    "kind": "parsha",
    "ids": [
      "vayechi"
    ],
    "title": "Vayechi"
  },
  {
    "date": "2027-01-02",
    "kind": "parsha",
    "ids": [
      "shemot"
    ],
    "title": "Shemot"
  },
  {
    "date": "2027-01-09",
    "kind": "parsha",
    "ids": [
      "vaera"
    ],
    "title": "Vaera"
  },
  {
    "date": "2027-01-16",
    "kind": "parsha",
    "ids": [
      "bo"
    ],
    "title": "Bo"
  },
  {
    "date": "2027-01-23",
    "kind": "parsha",
    "ids": [
      "beshalach"
    ],
    "title": "Beshalach"
  },
  {
    "date": "2027-01-30",
    "kind": "parsha",
    "ids": [
      "yitro"
    ],
    "title": "Yitro"
  },
  {
    "date": "2027-02-06",
    "kind": "parsha",
    "ids": [
      "mishpatim"
    ],
    "title": "Mishpatim"
  },
  {
    "date": "2027-02-13",
    "kind": "parsha",
    "ids": [
      "terumah"
    ],
    "title": "Terumah"
  },
  {
    "date": "2027-02-20",
    "kind": "parsha",
    "ids": [
      "tetzaveh"
    ],
    "title": "Tetzaveh"
  },
  {
    "date": "2027-02-27",
    "kind": "parsha",
    "ids": [
      "ki-tisa"
    ],
    "title": "Ki Tisa"
  },
  {
    "date": "2027-03-06",
    "kind": "parsha",
    "ids": [
      "vayakhel"
    ],
    "title": "Vayakhel"
  },
  {
    "date": "2027-03-13",
    "kind": "parsha",
    "ids": [
      "pekudei"
    ],
    "title": "Pekudei"
  },
  {
    "date": "2027-03-20",
    "kind": "parsha",
    "ids": [
      "vayikra"
    ],
    "title": "Vayikra"
  },
  {
    "date": "2027-03-27",
    "kind": "parsha",
    "ids": [
      "tzav"
    ],
    "title": "Tzav"
  },
  {
    "date": "2027-04-03",
    "kind": "parsha",
    "ids": [
      "shmini"
    ],
    "title": "Shmini"
  },
  {
    "date": "2027-04-10",
    "kind": "parsha",
    "ids": [
      "tazria"
    ],
    "title": "Tazria"
  },
  {
    "date": "2027-04-17",
    "kind": "parsha",
    "ids": [
      "metzora"
    ],
    "title": "Metzora"
  },
  {
    "date": "2027-04-24",
    "kind": "holiday",
    "ids": [
      "pesach"
    ],
    "title": "Pesach"
  },
  {
    "date": "2027-05-01",
    "kind": "parsha",
    "ids": [
      "achrei-mot"
    ],
    "title": "Achrei Mot"
  },
  {
    "date": "2027-05-08",
    "kind": "parsha",
    "ids": [
      "kedoshim"
    ],
    "title": "Kedoshim"
  },
  {
    "date": "2027-05-15",
    "kind": "parsha",
    "ids": [
      "emor"
    ],
    "title": "Emor"
  },
  {
    "date": "2027-05-22",
    "kind": "parsha",
    "ids": [
      "behar"
    ],
    "title": "Behar"
  },
  {
    "date": "2027-05-29",
    "kind": "parsha",
    "ids": [
      "bechukotai"
    ],
    "title": "Bechukotai"
  },
  {
    "date": "2027-06-05",
    "kind": "parsha",
    "ids": [
      "bamidbar"
    ],
    "title": "Bamidbar"
  },
  {
    "date": "2027-06-12",
    "kind": "holiday",
    "ids": [
      "shavuot"
    ],
    "title": "Shavuot"
  },
  {
    "date": "2027-06-19",
    "kind": "parsha",
    "ids": [
      "nasso"
    ],
    "title": "Nasso"
  },
  {
    "date": "2027-06-26",
    "kind": "parsha",
    "ids": [
      "behaalotecha"
    ],
    "title": "Beha'alotcha"
  },
  {
    "date": "2027-07-03",
    "kind": "parsha",
    "ids": [
      "shlach"
    ],
    "title": "Sh'lach"
  },
  {
    "date": "2027-07-10",
    "kind": "parsha",
    "ids": [
      "korach"
    ],
    "title": "Korach"
  },
  {
    "date": "2027-07-17",
    "kind": "parsha",
    "ids": [
      "chukat",
      "balak"
    ],
    "title": "Chukat / Balak"
  },
  {
    "date": "2027-07-24",
    "kind": "parsha",
    "ids": [
      "pinchas"
    ],
    "title": "Pinchas"
  },
  {
    "date": "2027-07-31",
    "kind": "parsha",
    "ids": [
      "matot",
      "masei"
    ],
    "title": "Matot / Masei"
  },
  {
    "date": "2027-08-07",
    "kind": "parsha",
    "ids": [
      "devarim"
    ],
    "title": "Devarim"
  },
  {
    "date": "2027-08-14",
    "kind": "parsha",
    "ids": [
      "vaetchanan"
    ],
    "title": "Vaetchanan"
  },
  {
    "date": "2027-08-21",
    "kind": "parsha",
    "ids": [
      "eikev"
    ],
    "title": "Eikev"
  },
  {
    "date": "2027-08-28",
    "kind": "parsha",
    "ids": [
      "reeh"
    ],
    "title": "Re'eh"
  },
  {
    "date": "2027-09-04",
    "kind": "parsha",
    "ids": [
      "shoftim"
    ],
    "title": "Shoftim"
  },
  {
    "date": "2027-09-11",
    "kind": "parsha",
    "ids": [
      "ki-teitzei"
    ],
    "title": "Ki Teitzei"
  },
  {
    "date": "2027-09-18",
    "kind": "parsha",
    "ids": [
      "ki-tavo"
    ],
    "title": "Ki Tavo"
  },
  {
    "date": "2027-09-25",
    "kind": "parsha",
    "ids": [
      "nitzavim",
      "vayelech"
    ],
    "title": "Nitzavim / Vayelech"
  },
  {
    "date": "2027-10-02",
    "kind": "holiday",
    "ids": [
      "rosh-hashanah"
    ],
    "title": "Rosh Hashanah"
  },
  {
    "date": "2027-10-09",
    "kind": "parsha",
    "ids": [
      "haazinu"
    ],
    "title": "Ha'azinu"
  },
  {
    "date": "2027-10-16",
    "kind": "holiday",
    "ids": [
      "sukkot"
    ],
    "title": "Sukkot"
  },
  {
    "date": "2027-10-23",
    "kind": "holiday",
    "ids": [
      "shmini-atzeret",
      "vzot-haberachah"
    ],
    "title": "Shmini Atzeret. V'Zot HaBerachah is read the next day, on Simchat Torah"
  },
  {
    "date": "2027-10-30",
    "kind": "parsha",
    "ids": [
      "bereshit"
    ],
    "title": "Bereshit"
  },
  {
    "date": "2027-11-06",
    "kind": "parsha",
    "ids": [
      "noach"
    ],
    "title": "Noach"
  },
  {
    "date": "2027-11-13",
    "kind": "parsha",
    "ids": [
      "lech-lecha"
    ],
    "title": "Lech-Lecha"
  },
  {
    "date": "2027-11-20",
    "kind": "parsha",
    "ids": [
      "vayera"
    ],
    "title": "Vayera"
  },
  {
    "date": "2027-11-27",
    "kind": "parsha",
    "ids": [
      "chayei-sara"
    ],
    "title": "Chayei Sara"
  },
  {
    "date": "2027-12-04",
    "kind": "parsha",
    "ids": [
      "toldot"
    ],
    "title": "Toldot"
  },
  {
    "date": "2027-12-11",
    "kind": "parsha",
    "ids": [
      "vayetzei"
    ],
    "title": "Vayetzei"
  },
  {
    "date": "2027-12-18",
    "kind": "parsha",
    "ids": [
      "vayishlach"
    ],
    "title": "Vayishlach"
  },
  {
    "date": "2027-12-25",
    "kind": "parsha",
    "ids": [
      "vayeshev"
    ],
    "title": "Vayeshev"
  },
  {
    "date": "2028-01-01",
    "kind": "parsha",
    "ids": [
      "miketz"
    ],
    "title": "Miketz"
  },
  {
    "date": "2028-01-08",
    "kind": "parsha",
    "ids": [
      "vayigash"
    ],
    "title": "Vayigash"
  },
  {
    "date": "2028-01-15",
    "kind": "parsha",
    "ids": [
      "vayechi"
    ],
    "title": "Vayechi"
  },
  {
    "date": "2028-01-22",
    "kind": "parsha",
    "ids": [
      "shemot"
    ],
    "title": "Shemot"
  },
  {
    "date": "2028-01-29",
    "kind": "parsha",
    "ids": [
      "vaera"
    ],
    "title": "Vaera"
  },
  {
    "date": "2028-02-05",
    "kind": "parsha",
    "ids": [
      "bo"
    ],
    "title": "Bo"
  },
  {
    "date": "2028-02-12",
    "kind": "parsha",
    "ids": [
      "beshalach"
    ],
    "title": "Beshalach"
  },
  {
    "date": "2028-02-19",
    "kind": "parsha",
    "ids": [
      "yitro"
    ],
    "title": "Yitro"
  },
  {
    "date": "2028-02-26",
    "kind": "parsha",
    "ids": [
      "mishpatim"
    ],
    "title": "Mishpatim"
  },
  {
    "date": "2028-03-04",
    "kind": "parsha",
    "ids": [
      "terumah"
    ],
    "title": "Terumah"
  },
  {
    "date": "2028-03-11",
    "kind": "parsha",
    "ids": [
      "tetzaveh"
    ],
    "title": "Tetzaveh"
  },
  {
    "date": "2028-03-18",
    "kind": "parsha",
    "ids": [
      "ki-tisa"
    ],
    "title": "Ki Tisa"
  },
  {
    "date": "2028-03-25",
    "kind": "parsha",
    "ids": [
      "vayakhel",
      "pekudei"
    ],
    "title": "Vayakhel / Pekudei"
  },
  {
    "date": "2028-04-01",
    "kind": "parsha",
    "ids": [
      "vayikra"
    ],
    "title": "Vayikra"
  },
  {
    "date": "2028-04-08",
    "kind": "parsha",
    "ids": [
      "tzav"
    ],
    "title": "Tzav"
  },
  {
    "date": "2028-04-15",
    "kind": "holiday",
    "ids": [
      "pesach"
    ],
    "title": "Pesach"
  },
  {
    "date": "2028-04-22",
    "kind": "parsha",
    "ids": [
      "shmini"
    ],
    "title": "Shmini"
  },
  {
    "date": "2028-04-29",
    "kind": "parsha",
    "ids": [
      "tazria",
      "metzora"
    ],
    "title": "Tazria / Metzora"
  },
  {
    "date": "2028-05-06",
    "kind": "parsha",
    "ids": [
      "achrei-mot",
      "kedoshim"
    ],
    "title": "Achrei Mot / Kedoshim"
  },
  {
    "date": "2028-05-13",
    "kind": "parsha",
    "ids": [
      "emor"
    ],
    "title": "Emor"
  },
  {
    "date": "2028-05-20",
    "kind": "parsha",
    "ids": [
      "behar",
      "bechukotai"
    ],
    "title": "Behar / Bechukotai"
  },
  {
    "date": "2028-05-27",
    "kind": "parsha",
    "ids": [
      "bamidbar"
    ],
    "title": "Bamidbar"
  },
  {
    "date": "2028-06-03",
    "kind": "parsha",
    "ids": [
      "nasso"
    ],
    "title": "Nasso"
  },
  {
    "date": "2028-06-10",
    "kind": "parsha",
    "ids": [
      "behaalotecha"
    ],
    "title": "Beha'alotcha"
  },
  {
    "date": "2028-06-17",
    "kind": "parsha",
    "ids": [
      "shlach"
    ],
    "title": "Sh'lach"
  },
  {
    "date": "2028-06-24",
    "kind": "parsha",
    "ids": [
      "korach"
    ],
    "title": "Korach"
  },
  {
    "date": "2028-07-01",
    "kind": "parsha",
    "ids": [
      "chukat"
    ],
    "title": "Chukat"
  },
  {
    "date": "2028-07-08",
    "kind": "parsha",
    "ids": [
      "balak"
    ],
    "title": "Balak"
  },
  {
    "date": "2028-07-15",
    "kind": "parsha",
    "ids": [
      "pinchas"
    ],
    "title": "Pinchas"
  },
  {
    "date": "2028-07-22",
    "kind": "parsha",
    "ids": [
      "matot",
      "masei"
    ],
    "title": "Matot / Masei"
  },
  {
    "date": "2028-07-29",
    "kind": "parsha",
    "ids": [
      "devarim"
    ],
    "title": "Devarim"
  },
  {
    "date": "2028-08-05",
    "kind": "parsha",
    "ids": [
      "vaetchanan"
    ],
    "title": "Vaetchanan"
  },
  {
    "date": "2028-08-12",
    "kind": "parsha",
    "ids": [
      "eikev"
    ],
    "title": "Eikev"
  },
  {
    "date": "2028-08-19",
    "kind": "parsha",
    "ids": [
      "reeh"
    ],
    "title": "Re'eh"
  },
  {
    "date": "2028-08-26",
    "kind": "parsha",
    "ids": [
      "shoftim"
    ],
    "title": "Shoftim"
  },
  {
    "date": "2028-09-02",
    "kind": "parsha",
    "ids": [
      "ki-teitzei"
    ],
    "title": "Ki Teitzei"
  },
  {
    "date": "2028-09-09",
    "kind": "parsha",
    "ids": [
      "ki-tavo"
    ],
    "title": "Ki Tavo"
  },
  {
    "date": "2028-09-16",
    "kind": "parsha",
    "ids": [
      "nitzavim",
      "vayelech"
    ],
    "title": "Nitzavim / Vayelech"
  },
  {
    "date": "2028-09-23",
    "kind": "parsha",
    "ids": [
      "haazinu"
    ],
    "title": "Ha'azinu"
  },
  {
    "date": "2028-09-30",
    "kind": "holiday",
    "ids": [
      "yom-kippur"
    ],
    "title": "Yom Kippur"
  },
  {
    "date": "2028-10-07",
    "kind": "holiday",
    "ids": [
      "sukkot"
    ],
    "title": "Sukkot"
  },
  {
    "date": "2028-10-14",
    "kind": "parsha",
    "ids": [
      "bereshit"
    ],
    "title": "Bereshit"
  }
];
  var names = {
  "bereshit": "Bereshit",
  "noach": "Noach",
  "lech-lecha": "Lech-Lecha",
  "vayera": "Vayera",
  "chayei-sara": "Chayei Sara",
  "toldot": "Toldot",
  "vayetzei": "Vayetzei",
  "vayishlach": "Vayishlach",
  "vayeshev": "Vayeshev",
  "miketz": "Miketz",
  "vayigash": "Vayigash",
  "vayechi": "Vayechi",
  "shemot": "Shemot",
  "vaera": "Vaera",
  "bo": "Bo",
  "beshalach": "Beshalach",
  "yitro": "Yitro",
  "mishpatim": "Mishpatim",
  "terumah": "Terumah",
  "tetzaveh": "Tetzaveh",
  "ki-tisa": "Ki Tisa",
  "vayakhel": "Vayakhel",
  "pekudei": "Pekudei",
  "vayikra": "Vayikra",
  "tzav": "Tzav",
  "shmini": "Shmini",
  "tazria": "Tazria",
  "metzora": "Metzora",
  "achrei-mot": "Achrei Mot",
  "kedoshim": "Kedoshim",
  "emor": "Emor",
  "behar": "Behar",
  "bechukotai": "Bechukotai",
  "bamidbar": "Bamidbar",
  "nasso": "Nasso",
  "behaalotecha": "Beha'alotcha",
  "shlach": "Sh'lach",
  "korach": "Korach",
  "chukat": "Chukat",
  "balak": "Balak",
  "pinchas": "Pinchas",
  "matot": "Matot",
  "masei": "Masei",
  "devarim": "Devarim",
  "vaetchanan": "Vaetchanan",
  "eikev": "Eikev",
  "reeh": "Re'eh",
  "shoftim": "Shoftim",
  "ki-teitzei": "Ki Teitzei",
  "ki-tavo": "Ki Tavo",
  "nitzavim": "Nitzavim",
  "vayelech": "Vayelech",
  "haazinu": "Ha'azinu",
  "vzot-haberachah": "V'Zot HaBerachah"
};
  root.BB_SCHEDULE = schedule;
  root.BB_PARSHA_NAMES = names;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { schedule: schedule, names: names };
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
