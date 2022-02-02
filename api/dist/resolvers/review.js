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
const isAuth_1 = require("./../middleware/isAuth");
const Review_1 = require("../entities/Review");
const type_graphql_1 = require("type-graphql");
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
let ReviewResolver = class ReviewResolver {
    async reviews() {
        return Review_1.Review.find();
    }
    review(_id) {
        return Review_1.Review.findOne(_id);
    }
    async createReview(input, { req }) {
        const review = await Review_1.Review.create(Object.assign(Object.assign({}, input), { userId: req.session.userId })).save();
        return review;
    }
    async updateReview(_id, comment) {
        const review = await Review_1.Review.findOne({ _id });
        if (!review) {
            return null;
        }
        if (typeof comment !== 'undefined') {
            Review_1.Review.update({ _id }, { comment });
        }
        return review;
    }
    async deleteReview(_id) {
        await Review_1.Review.delete(_id);
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Review_1.Review]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
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
ReviewResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], ReviewResolver);
exports.ReviewResolver = ReviewResolver;
//# sourceMappingURL=review.js.map