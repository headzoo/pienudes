module.exports = function(req, res, next) {
    if (!req.user || req.user.global_rank < 255) {
        return res.send(401);
    }
    next();
};