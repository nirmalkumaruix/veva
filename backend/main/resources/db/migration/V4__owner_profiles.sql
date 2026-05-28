create table owner_profile (
  id uuid primary key,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted boolean not null default false,
  user_id uuid not null references users(id),
  business_name varchar(255),
  gst_number varchar(80),
  payout_upi_id varchar(120),
  billing_address varchar(1000),
  logo_url varchar(1000)
);

create unique index idx_owner_profile_user on owner_profile(user_id) where deleted = false;

insert into owner_profile(id,created_at,updated_at,deleted,user_id,business_name,payout_upi_id,billing_address)
values ('77777777-7777-7777-7777-777777777777',now(),now(),false,'11111111-1111-1111-1111-111111111111','Veetu Vadagai Demo Owner','rent@veetuvadagai','12 Temple Street, Chennai');
