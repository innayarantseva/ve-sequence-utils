"use strict";

var getComplementSequenceString = require("./getComplementSequenceString");

var _require = require("ve-range-utils"),
    normalizePositionByRangeLength = _require.normalizePositionByRangeLength;

var cutSequenceByRestrictionEnzyme = require("./cutSequenceByRestrictionEnzyme");
module.exports = function getPossiblePartsFromSequenceAndEnzyme(seqData, restrictionEnzymes) {
  // ac.throw([
  //     ac.string,
  //     ac.bool,
  //     ac.shape({
  //         "name": ac.string,
  //         "site": ac.string,
  //         "forwardRegex": ac.string,
  //         "reverseRegex": ac.string,
  //         "topSnipOffset": ac.number,
  //         "bottomSnipOffset": ac.number
  //     })
  // ], arguments);
  restrictionEnzymes = restrictionEnzymes.length ? restrictionEnzymes : [restrictionEnzymes];
  var bps = seqData.sequence;
  var seqLen = bps.length;
  var circular = seqData.circular;
  var cutsites = [];
  restrictionEnzymes.forEach(function (enzyme) {
    var newCutsites = cutSequenceByRestrictionEnzyme(bps, circular, enzyme);
    cutsites = cutsites.concat(newCutsites);
  });
  var parts = [];
  if (cutsites.length < 1) {
    return parts;
  } else if (cutsites.length === 1) {
    parts.push(getPartBetweenEnzymesWithInclusiveOverhangs(cutsites[0], cutsites[0], seqLen));
    return parts;
  } else {
    var pairs = pairwise(cutsites);
    pairs.forEach(function (pair) {
      var cut1 = pair[0];
      var cut2 = pair[1];
      var part1 = getPartBetweenEnzymesWithInclusiveOverhangs(cut1, cut2, seqLen);
      var part2 = getPartBetweenEnzymesWithInclusiveOverhangs(cut2, cut1, seqLen);
      if (circular || !(part1.start > part1.end)) {
        //only add origin spanning parts if the sequence is circular
        parts.push(part1);
      }
      if (circular || !(part2.start > part2.end)) {
        //only add origin spanning parts if the sequence is circular
        parts.push(part2);
      }
    });
    return parts;
  }
};

function getPartBetweenEnzymesWithInclusiveOverhangs(cut1, cut2, seqLen) {
  var firstCutOffset = getEnzymeRelativeOffset(cut1.restrictionEnzyme);
  var secondCutOffset = getEnzymeRelativeOffset(cut2.restrictionEnzyme);
  var start = cut1.topSnipBeforeBottom ? cut1.topSnipPosition : cut1.bottomSnipPosition;
  var end = normalizePositionByRangeLength((cut2.topSnipBeforeBottom ? cut2.bottomSnipPosition : cut2.topSnipPosition) - 1, seqLen);
  return {
    start: start,
    start1Based: start + 1,
    end: end,
    end1Based: end + 1,
    firstCut: cut1,
    //the offset is always counting with 0 being at the top snip position
    firstCutOffset: firstCutOffset,
    firstCutOverhang: cut1.overhangBps,
    firstCutOverhangTop: firstCutOffset > 0 ? cut1.overhangBps : "",
    firstCutOverhangBottom: firstCutOffset < 0 ? getComplementSequenceString(cut1.overhangBps) : "",
    secondCut: cut2,
    //the offset is always counting with 0 being at the top snip position
    secondCutOffset: secondCutOffset,
    secondCutOverhang: cut2.overhangBps,
    secondCutOverhangTop: secondCutOffset < 0 ? cut2.overhangBps : "",
    secondCutOverhangBottom: secondCutOffset > 0 ? getComplementSequenceString(cut2.overhangBps) : ""
  };
}

function getEnzymeRelativeOffset(enzyme) {
  //the offset is always counting with 0 being at the top snip position
  return enzyme.bottomSnipOffset - enzyme.topSnipOffset;
}

function pairwise(list) {
  if (list.length < 2) {
    return [];
  }
  var first = list[0],
      rest = list.slice(1),
      pairs = rest.map(function (x) {
    return [first, x];
  });
  return pairs.concat(pairwise(rest));
}