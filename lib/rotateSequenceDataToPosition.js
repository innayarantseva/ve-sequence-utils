"use strict";

var _require = require("lodash"),
    map = _require.map;

var _require2 = require("ve-range-utils"),
    adjustRangeToRotation = _require2.adjustRangeToRotation;

var tidyUpSequenceData = require("./tidyUpSequenceData");
var modifiableTypes = require("./annotationTypes").modifiableTypes;
var rotateBpsToPosition = require("./rotateBpsToPosition");

module.exports = function rotateSequenceDataToPosition(sequenceData, caretPosition) {
  var newSequenceData = tidyUpSequenceData(sequenceData);

  //update the sequence
  newSequenceData.sequence = rotateBpsToPosition(newSequenceData.sequence, caretPosition);

  //handle the insert
  modifiableTypes.forEach(function (annotationType) {
    //update the annotations:
    //handle the delete if necessary
    newSequenceData[annotationType] = adjustAnnotationsToRotation(newSequenceData[annotationType], caretPosition, newSequenceData.sequence.length);
  });
  return newSequenceData;
};

function adjustAnnotationsToRotation(annotationsToBeAdjusted, positionToRotateTo, maxLength) {
  return map(annotationsToBeAdjusted, function (annotation) {
    return adjustRangeToRotation(annotation, positionToRotateTo, maxLength);
  }).filter(function (range) {
    return !!range;
  }); //filter any fully deleted ranges
}