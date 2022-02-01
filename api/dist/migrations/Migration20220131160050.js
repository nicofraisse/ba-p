"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220131160050 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220131160050 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "user" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
    }
}
exports.Migration20220131160050 = Migration20220131160050;
//# sourceMappingURL=Migration20220131160050.js.map