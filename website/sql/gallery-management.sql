-- Run once in the DENUCHANGE Supabase SQL editor before using live gallery management.
-- Existing uploads remain unpublished drafts; their original files are retained.
begin;

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  uploaded_by text
);

alter table public.gallery_images
  add column if not exists day_id text,
  add column if not exists group_id text,
  add column if not exists group_title text,
  add column if not exists group_order integer not null default 1000,
  add column if not exists media_kind text not null default 'photo',
  add column if not exists sort_order double precision not null default 1000000,
  add column if not exists original_filename text,
  add column if not exists file_size bigint,
  add column if not exists preview_path text,
  add column if not exists width integer not null default 0,
  add column if not exists height integer not null default 0,
  add column if not exists is_published boolean not null default false,
  add column if not exists upload_complete boolean not null default true;

-- The initial true default preserves earlier uploads; new uploads start incomplete.
alter table public.gallery_images alter column upload_complete set default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.gallery_images'::regclass and conname = 'gallery_images_media_kind_check') then
    alter table public.gallery_images add constraint gallery_images_media_kind_check check (media_kind in ('photo', 'collage', 'video'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.gallery_images'::regclass and conname = 'gallery_images_publication_check') then
    alter table public.gallery_images add constraint gallery_images_publication_check check (
      not is_published or (
        upload_complete
        and day_id is not null and day_id in ('day-0', 'day-1', 'day-2', 'day-3', 'day-4', 'overview')
        and group_id is not null and length(trim(group_id)) > 0
        and group_title is not null and length(trim(group_title)) > 0
      )
    );
  end if;
end $$;

create index if not exists gallery_images_created_order_idx on public.gallery_images (created_at, id);
create index if not exists gallery_images_published_order_idx on public.gallery_images (day_id, group_order, sort_order, id)
  where is_published and upload_complete;

-- This app uses its own HttpOnly session cookie, checked by /api/app/gallery.
-- Browsers never read or write gallery metadata directly through the Data API.
alter table public.gallery_images enable row level security;
revoke all privileges on table public.gallery_images from public, anon, authenticated;
grant select, insert, update, delete on table public.gallery_images to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 104857600, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
on conflict (id) do nothing;

-- Preserve a bucket's existing MIME list and its unrestricted setting, if present.
update storage.buckets
set allowed_mime_types = case
    when allowed_mime_types is null then null
    when 'video/mp4' = any(allowed_mime_types) then allowed_mime_types
    else array_append(allowed_mime_types, 'video/mp4')
  end,
  file_size_limit = case
    when file_size_limit is null then null
    else greatest(file_size_limit, 104857600)
  end
where id = 'gallery';

commit;
