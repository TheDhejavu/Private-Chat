
module.exports.requiresLogin= function(req, res, next) {
  if (req.session && req.session.userId) {
      return next();
  } else {
    res.redirect("/login");
  }
}

module.exports.alreadyLoggedIn = function(req, res, next) {
  if (req.session && req.session.userId) {
       res.redirect("/find");
  } else {
      return next();
  }
}
