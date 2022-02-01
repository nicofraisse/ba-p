import { Migration } from '@mikro-orm/migrations';

export class Migration20220130152431 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "restaurant" ("_id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" text not null);');
  }

}
