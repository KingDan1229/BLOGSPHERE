# How this blogging platform works

This is my backend for the blogging case study. Flask serves Jinja pages and a JSON API for the frontend. Supabase stores posts, comments, likes, and images.

## Overall idea

The frontend calls `/api/...` endpoints. Flask reads or writes data in Supabase, then returns JSON like `{ "success": true, posts: [...] }`. CORS is enabled so a separate frontend can call the API.

Jinja pages still work for quick browser testing, but the main contract for the team frontend is the API.

## Field mapping

Supabase uses snake_case columns. The API returns camelCase for the frontend:

- `content` (was body)
- `createdAt` / `updatedAt`
- `userId` / `userName`
- `imageUrl`
- `likeCount` / `liked`

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/posts | all posts |
| POST | /api/posts | create post |
| PUT | /api/posts/:id | update post |
| DELETE | /api/posts/:id | delete post |
| POST | /api/posts/:id/like | toggle like |
| GET | /api/posts/:id/comments | list comments |
| POST | /api/posts/:id/comments | add comment |
| GET | /api/users/:id/posts | posts by user |

Send `userId` / `userName` in the JSON body, query string, or headers `X-User-Id` / `X-User-Name`.

## SQL for Supabase

If you already created the old tables, run the migration section. For a fresh project, use the create section.

### Fresh create

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text default '',
  tags text[] default '{}',
  image_url text,
  published boolean default false,
  user_id text,
  user_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author text default 'Anonymous',
  content text not null,
  user_id text,
  created_at timestamptz default now()
);

create table likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id text not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;

create policy "public read posts" on posts for select using (true);
create policy "public insert posts" on posts for insert with check (true);
create policy "public update posts" on posts for update using (true);
create policy "public delete posts" on posts for delete using (true);

create policy "public read comments" on comments for select using (true);
create policy "public insert comments" on comments for insert with check (true);

create policy "public read likes" on likes for select using (true);
create policy "public insert likes" on likes for insert with check (true);
create policy "public delete likes" on likes for delete using (true);
```

### Migration from old schema

```sql
alter table posts rename column body to content;
alter table posts add column if not exists user_id text;
alter table posts add column if not exists user_name text;
alter table posts add column if not exists updated_at timestamptz default now();

alter table comments rename column body to content;
alter table comments add column if not exists user_id text;

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  user_id text not null,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

alter table likes enable row level security;
create policy "public read likes" on likes for select using (true);
create policy "public insert likes" on likes for insert with check (true);
create policy "public delete likes" on likes for delete using (true);
```

Also create a public Storage bucket named `blog-images`.
