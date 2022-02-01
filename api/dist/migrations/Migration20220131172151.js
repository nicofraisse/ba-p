"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220131172151 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220131172151 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    }
}
exports.Migration20220131172151 = Migration20220131172151;
//# sourceMappingURL=Migration20220131172151.js.map