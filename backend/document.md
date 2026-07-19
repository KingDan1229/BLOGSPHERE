# How this blogging platform works

This is my backend for the blogging case study. I used Flask so the same Python app can handle the pages and talk to Supabase. There is no login yet, I only connected storage and the database.

## Overall idea

When someone opens the site, Flask gets the request, grabs data from Supabase if needed, then fills a Jinja template and sends HTML back. The browser is just showing pages. The real work is in Python plus Supabase.

Supabase is where stuff actually lives. Posts and comments are rows in tables. Images go into a storage bucket called blog-images. My Python code uses the Supabase client to insert, update, delete, and upload. Keys and the project URL sit in a .env file so they are not hard coded in the source.

## Main files

app.py is the routes. Like home, create post, edit, delete, and posting a comment. It reads form data, maybe uploads an image, then calls functions in db.py.

db.py is the Supabase side. That is where list_posts, create_post, upload_file, and the comment helpers are. app.py stays mostly about pages and forms.

config.py just loads the env values. templates/ is the HTML Jinja builds, and static/style.css is the styling. I kept HTML and CSS in this project because Flask is serving the UI itself, not a separate frontend.

## How a post gets created

1. User fills the form on the new post page.
2. Flask receives the POST.
3. If they attached an image, db.py uploads the bytes to Supabase Storage and gets a public URL back.
4. Then it inserts a row into the posts table with title, body, category, tags, image url, and whether it is published.
5. User gets sent to the post detail page.

Editing is basically the same except it updates the existing row. Home only shows posts where published is true. All posts shows drafts too.

## Comments

Comments are a separate table linked by post_id. On the post page the form posts to a comment route, that inserts into comments, then reloads the page so the new comment shows up.

## Categories and tags

Category is just a text field on the post. Tags are stored as a list (text array in Supabase). On the form the user types them comma separated and Python splits that into a list before saving.

## What I did not do yet

Auth is skipped for now. Policies on the tables are open so the app can read and write without a logged in user. That is fine for the demo but it means anyone with the site open can change posts. Storage is public so the image links work in the browser.

## SQL I used in Supabase

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text default '',
  tags text[] default '{}',
  image_url text,
  published boolean default false,
  created_at timestamptz default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  author text default 'Anonymous',
  body text not null,
  created_at timestamptz default now()
);

alter table posts enable row level security;
alter table comments enable row level security;

create policy "public read posts" on posts for select using (true);
create policy "public insert posts" on posts for insert with check (true);
create policy "public update posts" on posts for update using (true);
create policy "public delete posts" on posts for delete using (true);

create policy "public read comments" on comments for select using (true);
create policy "public insert comments" on comments for insert with check (true);
```
