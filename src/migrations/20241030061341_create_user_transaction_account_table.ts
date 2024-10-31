import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('name').notNullable();
      table.date('date_of_birth').notNullable();
      table.integer('lga_id').notNullable();
      table.string('city').notNullable();
      table.string('address').notNullable();
      table.string('password').notNullable();
      table.timestamps(true, true); // created_at, updated_at
    })
    .createTable('transactions', (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE'); // Deletes all user's transactions if user is deleted
      table
        .enum(
          'transaction_type',
          ['fund', 'withdraw', 'transferIn', 'transferOut'],
          {
            useNative: true,
            enumName: 'transaction_type_enum',
          },
        )
        .notNullable();
      table.decimal('amount', 10, 2).notNullable();
      table.timestamps(true, true); // created_at, updated_at
    })
    .createTable('accounts', (table) => {
      table.increments('id').primary();
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE'); // Deletes user account if user is deleted
      table.decimal('balance', 10, 2).defaultTo(0.0).notNullable();
      table.timestamps(true, true); // created_at, updated_at
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('accounts')
    .dropTableIfExists('transactions')
    .dropTableIfExists('users');
}
