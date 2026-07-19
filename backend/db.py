from supabase import create_client
import config

def get_client():
    if not config.SUPABASE_URL or not config.SUPABASE_KEY:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_KEY in .env")
    return create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def upload_file(file_bytes, filename, content_type):
    client = get_client()
    path = filename
    client.storage.from_(config.STORAGE_BUCKET).upload(
        path,
        file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return client.storage.from_(config.STORAGE_BUCKET).get_public_url(path)

def list_posts():
    client = get_client()
    res = client.table("posts").select("*").order("created_at", desc=True).execute()
    return res.data or []

def get_post(post_id):
    client = get_client()
    res = client.table("posts").select("*").eq("id", post_id).single().execute()
    return res.data

def create_post(title, body, category, tags, image_url=None, published=False):
    client = get_client()
    row = {
        "title": title,
        "body": body,
        "category": category,
        "tags": tags,
        "image_url": image_url,
        "published": published,
    }
    res = client.table("posts").insert(row).execute()
    return res.data[0] if res.data else None

def update_post(post_id, title, body, category, tags, image_url=None, published=False):
    client = get_client()
    row = {
        "title": title,
        "body": body,
        "category": category,
        "tags": tags,
        "published": published,
    }
    if image_url:
        row["image_url"] = image_url
    res = client.table("posts").update(row).eq("id", post_id).execute()
    return res.data[0] if res.data else None

def delete_post(post_id):
    client = get_client()
    client.table("posts").delete().eq("id", post_id).execute()

def list_comments(post_id):
    client = get_client()
    res = (
        client.table("comments")
        .select("*")
        .eq("post_id", post_id)
        .order("created_at", desc=False)
        .execute()
    )
    return res.data or []

def add_comment(post_id, author, text):
    client = get_client()
    row = {"post_id": post_id, "author": author, "body": text}
    res = client.table("comments").insert(row).execute()
    return res.data[0] if res.data else None
