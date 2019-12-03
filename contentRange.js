function contentRange(size, range) {
  return `${range.type} ${range.start}-${range.end}/${size}`
}

module.exports = contentRange