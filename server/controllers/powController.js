const { createChallenge } = require('../utils/pow');

function getChallenge(req, res) {
  res.json(createChallenge());
}

module.exports = { getChallenge };
