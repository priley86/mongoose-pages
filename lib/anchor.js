//anchor pager sorts by _id asc, useful for paging when order doesn't matter

module.exports = function (conditions, fields, callback, options, anchorId) {

    var model = this;
    var limit = options.limit;

    // set pagination filters
    if (anchorId) conditions._id = { $gt: anchorId };

    //order by id asc
    options.sort = {_id : 1};

    return model.find(conditions, fields, options, function (err, docs) {

        if (err) {
            return callback(err);
        }
        else {

            var result = {};
            if (docs.length) {

                result.documents = docs;

                model.count(conditions, function (err, count) {

                    var totalPages = count;

                    if (limit) result.totalPages = Math.ceil(totalPages / limit);
                    else result.totalPages = 1;

                    if (result.totalPages > 1) {
                        result.prevAnchorId = anchorId;
                        result.nextAnchorId = docs[ docs.length - 1 ]._id.toString();

                    }
                    result.totalRecords = count;

                    callback(err, result);

                })
            }
            else {
                result.documents = [];
                result.totalPages = 0;
                result.totalRecords = 0;
                callback(err, result);
            }

        }
    }).lean();
};