"use strict";

var getComplementSequenceString = require("./getComplementSequenceString");
var tidyUpSequenceData = require("./tidyUpSequenceData");
// const ac = require('ve-api-check');
// ac.throw([ac.string,ac.bool],arguments);
module.exports = function getReverseComplementSequenceAndAnnoations(pSeqObj, options) {
  var seqObj = tidyUpSequenceData(pSeqObj, options);
  var newSeqObj = Object.assign({}, seqObj, {
    sequence: getComplementSequenceString(seqObj.sequence)
  });
  return tidyUpSequenceData(newSeqObj, options);
};