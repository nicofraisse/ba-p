"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewResolver = void 0;
const Review_1 = require("../entities/Review");
const typeorm_1 = require("typeorm");
const isAuth_1 = require("./../middleware/isAuth");
const type_graphql_1 = require("type-graphql");
const Upvote_1 = require("../entities/Upvote");
let ReviewInput = class ReviewInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], ReviewInput.prototype, "comment", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], ReviewInput.prototype, "rating", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], ReviewInput.prototype, "restaurantId", void 0);
ReviewInput = __decorate([
    (0, type_graphql_1.InputType)()
], ReviewInput);
let UpvoteResponse = class UpvoteResponse {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Number)
], UpvoteResponse.prototype, "points", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UpvoteResponse.prototype, "voteStatus", void 0);
UpvoteResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UpvoteResponse);
let ReviewResolver = class ReviewResolver {
    async reviews(restaurantId) {
        const reviews = await Review_1.Review.find(restaurantId ? { where: { restaurantId } } : {});
        return reviews;
    }
    review(id) {
        return Review_1.Review.findOne(id);
    }
    async createReview(input, { req }) {
        const review = await Review_1.Review.create(Object.assign(Object.assign({}, input), { userId: req.session.userId })).save();
        return review;
    }
    async updateReview(id, comment) {
        const review = await Review_1.Review.findOne(id);
        if (!review) {
            return null;
        }
        if (typeof comment !== 'undefined') {
            Review_1.Review.update({ id }, { comment });
        }
        return review;
    }
    async deleteReview(id) {
        await Review_1.Review.delete(id);
        return true;
    }
    async vote(reviewId, value, { req }) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const { userId } = req.session;
        const upvote = await Upvote_1.Upvote.findOne({ where: { reviewId, userId } });
        const review = (await Review_1.Review.findOne({ id: reviewId }));
        if (upvote && upvote.value !== realValue) {
            (0, typeorm_1.getConnection)().transaction(async (tm) => {
                await tm.query(` update upvote
        set value = $1
        where "userId" = $2 and "reviewId"  = $3;
`, [realValue, userId, reviewId]);
                await tm.query(` update review
        set points = points + $1
        where id = $2;
`, [2 * realValue, reviewId]);
            });
            return {
                points: review.points + 2 * realValue,
                voteStatus: realValue,
            };
        }
        else if (!upvote) {
            (0, typeorm_1.getConnection)().transaction(async (tm) => {
                await tm.query(`insert into upvote ("userId", "reviewId", value)
        values($1, $2, $3)
`, [userId, reviewId, realValue]);
                await tm.query(` update review
        set points = points + $1
        where id = $2;
`, [realValue, reviewId]);
            });
            return {
                points: review.points + realValue,
                voteStatus: realValue,
            };
        }
        return { points: review.points, voteStatus: review.voteStatus };
    }
    async voteStatus(review, { req }) {
        if (!req.session.userId) {
            return null;
        }
        const upvote = await Upvote_1.Upvote.findOne({
            where: { userId: req.session.userId, reviewId: review.id },
        });
        return upvote ? upvote.value : null;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Review_1.Review]),
    __param(0, (0, type_graphql_1.Arg)('restaurantId', () => type_graphql_1.Int, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "reviews", null);
__decorate([
    (0, type_graphql_1.Query)(() => Review_1.Review, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "review", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Review_1.Review),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReviewInput, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "createReview", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Review_1.Review, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id')),
    __param(1, (0, type_graphql_1.Arg)('comment', () => String)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "updateReview", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "deleteReview", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UpvoteResponse),
    __param(0, (0, type_graphql_1.Arg)('reviewId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "vote", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Review_1.Review, Object]),
    __metadata("design:returntype", Promise)
], ReviewResolver.prototype, "voteStatus", null);
ReviewResolver = __decorate([
    (0, type_graphql_1.Resolver)(Review_1.Review)
], ReviewResolver);
exports.ReviewResolver = ReviewResolver;
//# sourceMappingURL=review.js.map