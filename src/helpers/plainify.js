import _ from 'lodash';

/**
 * Convert grouped object to plain array with headers for each group.
 * Header objects are defined with iterator function.
 *
 * @param {Object}   sequence
 * @param {Array}    groupBy
 * @param {Function} iterator
 * @param {Number}   level
 * @param {Number}   parentIndex
 *
 * @return {{deepSequence: Array, ids: Array}}
 */
function plainify(sequence, groupBy, iterator, level = 0, parentIndex = 0) {
  let result = {
    deepSequence: [],
    ids: [],
  };

  if (_.isArray(sequence)) {
    const ids = _.map(sequence, 'id');

    result = {
      deepSequence: [...result.deepSequence, ...sequence],
      ids,
    };
  } else {
    _.forIn(sequence, (value, key) => {
      const index = result.deepSequence.length;

      const { deepSequence, ids } = plainify(
        value,
        groupBy,
        iterator,
        level + 1,
        index + parentIndex + 1,
      );

      result.deepSequence.push(iterator(groupBy, key, level, index, ids));
      result.deepSequence.push(...deepSequence);

      const right = result.deepSequence.length - 1;
      result.deepSequence[index].left = index + parentIndex;
      result.deepSequence[index].right = right + parentIndex;
      result.ids.push(...ids);
    });
  }

  return result;
}

export default plainify;
