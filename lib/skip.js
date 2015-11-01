module.exports = function (conditions, fields, callback, options, limit, pageNumber) {

    var model = this;

    if (pageNumber < 0) {
        callback(new Error('Invalid Page Number'));
    }
    else if (!(typeof pageNumber == 'undefined') && isNaN(pageNumber)) {
        callback(new Error('Invalid Page Number'));
    }
    else {

        pageNumber = +pageNumber || 0;

        // set pagination filters
        if (pageNumber) options.skip = limit * pageNumber;
        if (limit) options.limit = limit;

        return model.find(conditions, fields, options, function (err, docs) {

            var result = {};

            if (docs && docs.length) {

                result.documents = docs;

                model.count(conditions, function (err, count) {

                    var totalDocs = count;

                    if (limit) result.totalPages = Math.ceil(totalDocs / limit);
                    else result.totalPages = 1;

                    if (result.totalPages > 0) {
                        if (pageNumber > 0) result.prevPage  = pageNumber - 1;
                        if ((pageNumber +1) < result.totalPages) result.nextPage = pageNumber + 1;
                    }

                    result.totalRecords = count;

                    callback(err, result);
                });

            } else {
                result.documents = [];
                result.totalPages = 0;
                result.totalRecords = 0;
                callback(err, result);

            }
        }).lean();

    }
};