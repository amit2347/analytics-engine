module.exports.validateRequest = (schema) => (req, res, next) => {
    const sources = ['body', 'params', 'query'];
    for (const source of sources) {
      if (schema[source]) {
        const { error } = schema[source].validate(req[source]);
        if (error) {
          return res.status(422).json({ message: error.details[0].message });
        }
      }
    }
    next();
  };
