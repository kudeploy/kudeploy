import { RowLevelSecurityMigration } from '@nest-boot/row-level-security';

export class Migration20260607172951 extends RowLevelSecurityMigration {

  override async up(): Promise<void> {
    this.addSql(`create table "domain" ("id" bigserial primary key, "name" varchar(255) not null, "status" text check ("status" in ('PENDING', 'VERIFIED')) not null default 'PENDING', "verification_token" varchar(255) not null, "verified_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "workspace_id" bigint not null);`);
    this.addSql(`create index "domain_created_at_index" on "domain" ("created_at");`);
    this.addSql(`create index "domain_status_index" on "domain" ("status");`);
    this.addSql(`create index "domain_name_index" on "domain" ("name");`);
    this.addSql(`create index "domain_workspace_id_index" on "domain" ("workspace_id");`);
    this.addSql(`alter table "domain" add constraint "domain_workspace_id_name_unique" unique ("workspace_id", "name");`);

    this.addSql(`alter table "domain" add constraint "domain_workspace_id_foreign" foreign key ("workspace_id") references "workspace" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "public"."domain" enable row level security;`);
    this.addSql(`grant select, insert, update, delete on table "public"."domain" to authenticated;`);
    this.addSql(`do \$\$ declare sequence_identifier text; begin for sequence_identifier in select pg_get_serial_sequence('"public"."domain"', columns.column_name) from information_schema.columns where columns.table_schema = 'public' and columns.table_name = 'domain' and pg_get_serial_sequence('"public"."domain"', columns.column_name) is not null loop execute format('grant usage, select on sequence %s to authenticated', sequence_identifier); end loop; end \$\$;`);
    this.addSql(`drop policy if exists domain_workspace_all_authenticated_policy on "public"."domain";`);
    this.addSql(`create policy domain_workspace_all_authenticated_policy on "public"."domain" as permissive for all to authenticated using ((select current_setting('app.workspace_id', true)::bigint) = workspace_id) with check ((select current_setting('app.workspace_id', true)::bigint) = workspace_id);`);
  }

  override async down(): Promise<void> {
    this.addSql(`do \$\$
declare
  policy_count integer;
begin
  if to_regclass('"public"."domain"') is not null then
    execute 'drop policy if exists domain_workspace_all_authenticated_policy on "public"."domain"';

    select count(*) into policy_count
    from pg_policies
    where schemaname = 'public' and tablename = 'domain';

    if policy_count = 0 then
      execute 'alter table "public"."domain" disable row level security';
    end if;
  end if;
end
\$\$;`);
    this.addSql(`revoke select, insert, update, delete on table "public"."domain" from authenticated;`);
    this.addSql(`do \$\$ declare sequence_identifier text; begin for sequence_identifier in select pg_get_serial_sequence('"public"."domain"', columns.column_name) from information_schema.columns where columns.table_schema = 'public' and columns.table_name = 'domain' and pg_get_serial_sequence('"public"."domain"', columns.column_name) is not null loop execute format('revoke usage, select on sequence %s from authenticated', sequence_identifier); end loop; end \$\$;`);
    this.addSql(`drop table if exists "domain" cascade;`);
  }

}
