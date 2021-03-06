"use strict";

var getReverseComplementSequenceString = require("./getReverseComplementSequenceString");
var getReverseComplementAnnotation = require("./getReverseComplementAnnotation");
var annotationTypes = require("./annotationTypes");

var _require = require("lodash"),
    map = _require.map;

var tidyUpSequenceData = require("./tidyUpSequenceData");
// const ac = require('ve-api-check');
// ac.throw([ac.string,ac.bool],arguments);
module.exports = function getReverseComplementSequenceAndAnnoations(pSeqObj, options) {
  var seqObj = tidyUpSequenceData(pSeqObj, options);
  var newSeqObj = Object.assign({}, seqObj, {
    sequence: getReverseComplementSequenceString(seqObj.sequence)
  }, annotationTypes.reduce(function (acc, type) {
    if (seqObj[type]) {
      acc[type] = map(seqObj[type], function (annotation) {
        return getReverseComplementAnnotation(annotation, seqObj.sequence.length);
      });
    }
    return acc;
  }, {}));
  return tidyUpSequenceData(newSeqObj, options);
};