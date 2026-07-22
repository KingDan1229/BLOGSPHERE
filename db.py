from datetime import datetime, timezone
from supabase import create_client
import config

def get_client():
    if not config.SUPABASE_URL or not config.SUPABASE_KEY:
        raise RuntimeError("Set SUPABASE_URL and SUPABASE_KEY in .env")
    return create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def _iso(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value

def format_post(row, like_count=0, liked=False):
    if not row:
        return None
    return {
        "id": row.get("id"),
        "title": row.get("title"),
        "content": row.get("content"),
        "category": row.get("category") or "",
        "tags": row.get("tags") or [],
        "imageUrl": row.get("image_url"),
        "published": bool(row.get("published")),
        "userId": row.get("user_id"),
        "userName": row.get("user_name"),
        "createdAt": _iso(row.get("created_at")),
        "updatedAt": _iso(row.get("updated_at")),
        "likeCount": like_count,
        "liked": liked,
    }

def format_comment(row):
    if not row:
        return None
    return {
        "id": row.get("id"),
        "postId": row.get("post_id"),
        "author": row.get("author"),
        "content": row.get("content") or row.get("body"),
        "userId": row.get("user_id"),
        "createdAt": _iso(row.get("created_at")),
    }

def upload_file(file_bytes, filename, content_type):
    client = get_client()
    path = filename
    client.storage.from_(config.STORAGE_BUCKET).upload(
        path,
        file_bytes,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    return client.storage.from_(config.STORAGE_BUCKET).get_public_url(path)

def like_counts_for(post_ids):
    if not post_ids:
        return {}
    client = get_client()
    res = client.table("likes").select("post_id").in_("post_id", post_ids).execute()
    counts = {}
    for row in res.data or []:
        pid = row["post_id"]
        counts[pid] = counts.get(pid, 0) + 1
    return counts

def liked_post_ids(user_id, post_ids):
    if not user_id or not post_ids:
        return set()
    client = get_client()
    res = (
        client.table("likes")
        .select("post_id")
        .eq("user_id", user_id)
        .in_("post_id", post_ids)
        .execute()
    )
    return {row["post_id"] for row in (res.data or [])}

def enrich_posts(rows, user_id=None):
    ids = [r["id"] for r in rows]
    counts = like_counts_for(ids)
    liked = liked_post_ids(user_id, ids)
    return [
        format_post(r, like_count=counts.get(r["id"], 0), liked=r["id"] in liked)
        for r in rows
    ]

def list_posts(user_id=None):
    client = get_client()
    res = client.table("posts").select("*").order("created_at", desc=True).execute()
    return enrich_posts(res.data or [], user_id)

def list_posts_by_user(owner_id, user_id=None):
    client = get_client()
    res = (
        client.table("posts")
        .select("*")
        .eq("user_id", owner_id)
        .order("created_at", desc=True)
        .execute()
    )
    return enrich_posts(res.data or [], user_id)

def get_post(post_id, user_id=None):
    client = get_client()
    res = client.table("posts").select("*").eq("id", post_id).single().execute()
    enriched = enrich_posts([res.data], user_id) if res.data else []
    return enriched[0] if enriched else None

def create_post(
    title,
    content,
    category="",
    tags=None,
    image_url=None,
    published=False,
    user_id=None,
    user_name=None,
):
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()
    row = {
        "title": title,
        "content": content,
        "category": category or "",
        "tags": tags or [],
        "image_url": image_url,
        "published": published,
        "user_id": user_id,
        "user_name": user_name,
        "updated_at": now,
    }
    res = client.table("posts").insert(row).execute()
    if not res.data:
        return None
    return enrich_posts(res.data, user_id)[0]

def update_post(
    post_id,
    title,
    content,
    category="",
    tags=None,
    image_url=None,
    published=False,
    user_id=None,
):
    client = get_client()
    row = {
        "title": title,
        "content": content,
        "category": category or "",
        "tags": tags or [],
        "published": published,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if image_url is not None:
        row["image_url"] = image_url
    res = client.table("posts").update(row).eq("id", post_id).execute()
    if not res.data:
        return None
    return enrich_posts(res.data, user_id)[0]

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
    return [format_comment(c) for c in (res.data or [])]

def add_comment(post_id, author, content, user_id=None):
    client = get_client()
    row = {
        "post_id": post_id,
        "author": author or "Anonymous",
        "content": content,
        "user_id": user_id,
    }
    res = client.table("comments").insert(row).execute()
    return format_comment(res.data[0]) if res.data else None

def toggle_like(post_id, user_id):
    client = get_client()
    existing = (
        client.table("likes")
        .select("id")
        .eq("post_id", post_id)
        .eq("user_id", user_id)
        .execute()
    )
    if existing.data:
        client.table("likes").delete().eq("id", existing.data[0]["id"]).execute()
        liked = False
        message = "Unliked"
    else:
        client.table("likes").insert({"post_id": post_id, "user_id": user_id}).execute()
        liked = True
        message = "Liked"
    counts = like_counts_for([post_id])
    return {
        "liked": liked,
        "likeCount": counts.get(post_id, 0),
        "message": message,
    }
