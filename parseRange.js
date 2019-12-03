function parseRange(str, size) {
  const index = str.indexOf('=');
  const type = str.slice(0, index);
  const arr = str.slice(index + 1).split('-');
  let start = parseInt(arr[0], 10);
  let end = parseInt(arr[1], 10);

  if (isNaN(end)) end = size - 1;

  return {
    start,
    end,
    type
  }
}

module.exports = parseRange