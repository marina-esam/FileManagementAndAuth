/**
 * QueryBuilder — Session 6: Filtering, Sorting, Field Limiting, Pagination
 *
 * Usage:
 *   const features = new QueryBuilder(Model.find(), req.query)
 *       .filter()
 *       .sort()
 *       .limitFields()
 *       .paginate();
 *   const docs = await features.query;
 */
class QueryBuilder {
    constructor(query, queryString) {
        this.query = query;           // Mongoose Query object
        this.queryString = queryString; // req.query
    }

    filter() {
        const queryObj = { ...this.queryString };

        // Remove non-filter fields
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((field) => delete queryObj[field]);

        // Replace gte/gt/lte/lt with $gte/$gt/$lte/$lt
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this; // return this for chaining
    }


    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default: newest first
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // Always exclude the internal __v field
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 20;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = QueryBuilder;
