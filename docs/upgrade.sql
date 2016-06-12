alter table `user_scripts` add `name` VARCHAR(20) NOT NULL after `user_id`;
alter table user_scripts drop foreign key user_scripts_ibfk_1;
alter table user_scripts drop index `user_id`;
alter table user_scripts add unique index(`user_id`, `name`);
alter table user_scripts add foreign key (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
update `user_scripts` SET `name` = 'Default';