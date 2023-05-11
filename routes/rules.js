const express = require("express");
const router = express.Router();

router.post("/jre", function (req, res, next) {
  const { Engine } = require("json-rules-engine");
  let engine = new Engine();
  engine.addRule({
    conditions: {
      any: [
        {
          all: [
            {
              fact: "gameDuration",
              operator: "equal",
              value: 40,
            },
            {
              fact: "personalFoulCount",
              operator: "greaterThanInclusive",
              value: 5,
            },
          ],
        },
        {
          all: [
            {
              fact: "gameDuration",
              operator: "equal",
              value: 48,
            },
            {
              fact: "personalFoulCount",
              operator: "greaterThanInclusive",
              value: 6,
            },
          ],
        },
      ],
    },
    event: {
      // define the event to fire when the conditions evaluate truthy
      type: "fouledOut",
      params: {
        message: "Player has fouled out!",
      },
    },
    onSuccess() {
      res.json({ status: false, message: "Akumulasi kartu" });
    },
    onFailure() {
      res.json({
        status: true,
        message: "Masih boleh main",
      });
    },
  });

  let facts = req.body;
  engine.run(facts).then(({ events }) => {
    events.forEach((event) => console.log(event.params.message));
  });
});

router.post("/rools", async (req, res, next) => {
  const { Rools, Rule } = require("rools");
  const ruleMoodGreat = new Rule({
    name: "mood is great if 200 stars or more",
    when: (facts) => facts.user.stars >= 200,
    then: (facts) => {
      facts.user.mood = "great";
    },
  });
  const ruleGoWalking = new Rule({
    name: "go for a walk if mood is great and the weather is fine",
    when: [
      (facts) => facts.user.mood === "great",
      (facts) => facts.weather.temperature >= 20,
      (facts) => !facts.weather.rainy,
    ],
    then: (facts) => {
      facts.goWalking = true;
    },
  });

  let facts = req.body;
  const rools = new Rools();
  await rools.register([ruleMoodGreat, ruleGoWalking]);
  await rools.evaluate(facts);
  res.json({ facts });
});

module.exports = router;
