"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220130152431 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220130152431 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "restaurant" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" text not null);');
    }
}
exports.Migration20220130152431 = Migration20220130152431;
//# sourceMappingURL=Migration20220130152431.js.map