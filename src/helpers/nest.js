import _ from 'lodash';

/**
 * A multi-level groupBy for arrays inspired by D3's nest operator.
 * Nesting allows elements in an array to be grouped into a hierarchical tree structure;
 * think of it like the GROUP BY operator in SQL, except you can have multiple levels of
 * grouping, and the resulting output is a tree rather than a flat table.
 * The levels in the tree are specified by key functions.
 *
 * @see https://gist.github.com/joyrexus/9837596
 *
 * @param {Object[]} sequence
 * @param {Object[]} groupBy
 *
 * @return {Object}
 */
function nest(sequence, groupBy) {
  if (!groupBy.length) {
    return sequence;
  }
  const [first, ...rest] = groupBy;
  return _.mapValues(_.groupBy(sequence, first), value => nest(value, rest));
}

export default nest;
