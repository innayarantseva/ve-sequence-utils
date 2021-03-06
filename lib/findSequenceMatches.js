"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require("ve-range-utils"),
    modulateRangeBySequenceLength = _require.modulateRangeBySequenceLength,
    flipContainedRange = _require.flipContainedRange;

var _require2 = require("lodash"),
    reduce = _require2.reduce;

var escapeStringRegexp = require("escape-string-regexp");
var getAminoAcidStringFromSequenceString = require("./getAminoAcidStringFromSequenceString");

var _require3 = require("./bioData"),
    ambiguous_dna_values = _require3.ambiguous_dna_values,
    extended_protein_values = _require3.extended_protein_values;

var getReverseComplementSequenceString = require("./getReverseComplementSequenceString");

module.exports = function findSequenceMatches(sequence, searchString) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var matches = findSequenceMatchesTopStrand(sequence, searchString, options);
  var searchReverseStrand = options.searchReverseStrand;


  if (searchReverseStrand) {
    var sequenceLength = sequence.length;
    var reverseSeq = void 0;
    reverseSeq = getReverseComplementSequenceString(sequence);
    var reverseMatches = findSequenceMatchesTopStrand(reverseSeq, searchString, options);
    var flippedReverseMatches = reverseMatches.map(function (range) {
      return _extends({}, flipContainedRange(range, { start: 0, end: sequenceLength - 1 }, sequenceLength), {
        bottomStrand: true
      });
    });
    matches = [].concat(matches, flippedReverseMatches);
  }
  return matches;
};

function findSequenceMatchesTopStrand(sequence, searchString) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var isCircular = options.isCircular,
      isAmbiguous = options.isAmbiguous,
      isProteinSearch = options.isProteinSearch;

  var searchStringToUse = escapeStringRegexp(searchString);
  if (isAmbiguous) {
    if (isProteinSearch) {
      searchStringToUse = convertAmbiguousStringToRegex(searchStringToUse, true);
    } else {
      //we're searching DNA
      searchStringToUse = convertAmbiguousStringToRegex(searchStringToUse);
    }
  }
  if (!searchStringToUse) return []; //short circuit if nothing is actually being searched for (eg searching for "%%"")
  var sequenceToUse = sequence;
  if (isCircular) {
    sequenceToUse = sequenceToUse + sequenceToUse;
  }

  var sequencesToCheck = [{ seqToCheck: sequenceToUse, offset: 0 }];
  if (isProteinSearch) {
    sequencesToCheck = [{
      seqToCheck: getAminoAcidStringFromSequenceString(sequenceToUse),
      offset: 0
    }, {
      seqToCheck: getAminoAcidStringFromSequenceString(sequenceToUse.substr(1)),
      offset: 1
    }, {
      seqToCheck: getAminoAcidStringFromSequenceString(sequenceToUse.substr(2)),
      offset: 2
    }];
  }

  var ranges = [];
  sequencesToCheck.forEach(function (_ref) {
    var seqToCheck = _ref.seqToCheck,
        offset = _ref.offset;

    var reg = new RegExp(searchStringToUse, "ig");
    var match = void 0;
    var range = void 0;
    /* eslint-disable no-cond-assign*/

    while ((match = reg.exec(seqToCheck)) !== null) {
      range = {
        start: match.index,
        end: match.index + searchString.length - 1 //this should be the original searchString here j
      };
      if (isProteinSearch) {
        range.start = range.start * 3 + offset;
        range.end = range.end * 3 + 2 + offset;
      }
      ranges.push(modulateRangeBySequenceLength(range, sequence.length));
      reg.lastIndex = match.index + 1;
    }
    /* eslint-enable no-cond-assign*/
  });

  return ranges;
}

function convertAmbiguousStringToRegex(string, isProtein) {
  // Search for a DNA subseq in sequence.
  // use ambiguous values (like N = A or T or C or G, R = A or G etc.)
  // searches only on forward strand
  return reduce(string, function (acc, char) {
    var value = isProtein ? extended_protein_values[char.toUpperCase()] : ambiguous_dna_values[char.toUpperCase()];
    if (!value) return acc;
    if (value.length === 1) {
      acc += value;
    } else {
      acc += "[" + value + "]";
    }
    return acc;
  }, "");
}