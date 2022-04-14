const sanitizeDate = date => (date === '0001-01-01T00:00:00' ? null : date)

export default sanitizeDate
