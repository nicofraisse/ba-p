"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220201212451 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220201212451 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "user" add column "email" text null;');
    }
}
exports.Migration20220201212451 = Migration20220201212451;
//# sourceMappingURL=Migration20220201212451.js.map