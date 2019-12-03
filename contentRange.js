const contentRange = (size, range) => `${range.type} ${range ? `${range.start}-${range.end}` : '*'}/${size}`;

module.exports = contentRange