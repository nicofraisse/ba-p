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
exports.RestaurantResolver = void 0;
const typeorm_1 = require("typeorm");
const isAuth_1 = require("./../middleware/isAuth");
const Restaurant_1 = require("../entities/Restaurant");
const type_graphql_1 = require("type-graphql");
let RestaurantResolver = class RestaurantResolver {
    restaurants(limit, cursor) {
        const realLimit = Math.min(limit, 50);
        const query = (0, typeorm_1.getConnection)()
            .getRepository(Restaurant_1.Restaurant)
            .createQueryBuilder('r')
            .take(realLimit)
            .orderBy('"createdAt"', 'DESC');
        if (cursor) {
            query.where('"createdAt" < :cursor', {
                cursor: new Date(parseInt(cursor)),
            });
        }
        return query.getMany();
    }
    restaurant(_id) {
        return Restaurant_1.Restaurant.findOne({ _id });
    }
    async createRestaurant(name) {
        const restaurant = Restaurant_1.Restaurant.create({ name }).save();
        return restaurant;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Restaurant_1.Restaurant]),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "restaurants", null);
__decorate([
    (0, type_graphql_1.Query)(() => Restaurant_1.Restaurant, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "restaurant", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Restaurant_1.Restaurant),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createRestaurant", null);
RestaurantResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], RestaurantResolver);
exports.RestaurantResolver = RestaurantResolver;
//# sourceMappingURL=restaurant.js.map