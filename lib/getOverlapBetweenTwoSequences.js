"use strict";

var _require = require("ve-range-utils"),
    modulatePositionByRange = _require.modulatePositionByRange;
/**
 * This function gets the overlapping of one sequence to another based on sequence equality.
 * 
 * @param  {string} sequenceToFind     
 * @param  {string} sequenceToSearchIn 
 * @param  {object} options            optional
 * @return {object || null}            null if no overlap exists or a range object with .start and .end properties
 */


module.exports = function getOverlapBetweenTwoSequences(sequenceToFind, sequenceToSearchIn, options) {
  options = options || {};
  sequenceToSearchIn = sequenceToSearchIn.toLowerCase();
  sequenceToFind = sequenceToFind.toLowerCase();
  var lengthenedSeqToSearch = sequenceToSearchIn + sequenceToSearchIn;
  var index = lengthenedSeqToSearch.indexOf(sequenceToFind);
  if (index > -1) {
    return {
      start: index,
      end: modulatePositionByRange(index + sequenceToFind.length - 1, {
        start: 0,
        end: sequenceToSearchIn.length - 1
      })
    };
  } else {
    return null;
  }
};