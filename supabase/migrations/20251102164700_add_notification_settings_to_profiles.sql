alter table profiles
add column email_alerts_enabled boolean not null default true,
add column in_app_alerts_enabled boolean not null default true,
add column maintenance_reminders_enabled boolean not null default true;