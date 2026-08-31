function sendServerError(res, context, err, message) {
  console.error(context, err);
  return res.status(500).json({ message: message || 'Internal server error' });
}

module.exports = { sendServerError };
