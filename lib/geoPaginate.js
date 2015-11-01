/**
 * findGeoPaginate - a geo paginated query for mongoose models with 2d geospatial indices
 *
 * @param geoAttr - the model column with 2d geo index
 * @param multiplier - distance multiplier
 * @param maxDistance - maxDistance filter (in radians)
 * @param limit - pageSize (limit)
 * @param pageNumber - pageNumber to retrieve (zero based)
 * @param coordinate - 2d coordinate [long,lat]
 * @param filters - query search conditions
 * @param callback - callback function
 * @returns {Aggregate|Promise}
 */
module.exports = function (geoAttr, multiplier, maxDistance, limit, pageNumber, coordinate, filters, callback ) {

  var model = this;
  var matchFilters = { $match : {}};
  for (var attr in filters) { matchFilters["$match"][attr] = filters[attr];}

  if (pageNumber < 0) {
    callback(new Error('Invalid Page Number'));
  }
  else if (!(typeof pageNumber == 'undefined') && isNaN(pageNumber)) {
    callback(new Error('Invalid Page Number'));
  }
  else {

    pageNumber = +pageNumber || 0;

    // set pagination filters
    var skip = limit * pageNumber;

    return model.aggregate( [
        { "$geoNear": {
          "near": coordinate,
          "spherical": true,
          "distanceField": "distance",
          "maxDistance": maxDistance,
          "distanceMultiplier": multiplier
        }},
        matchFilters,
        { "$skip": skip },
        { "$limit": limit }
      ],
      function(err, docs) {
        if(err) { return callback(err); }

        var result = {};

        if(docs && docs.length){
          result.documents = docs;

          filters[geoAttr] = {$nearSphere: coordinate, $maxDistance: maxDistance};

          model.count(filters, function(err, count){

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

        }
        else {
          result.documents = [];
          result.totalPages = 0;
          result.totalRecords = 0;

          callback(err, result);
        }
      });

  }
};