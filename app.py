from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_cors import CORS
import uuid
import db
import config

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
CORS(app)

ALLOWED = {"png", "jpg", "jpeg", "gif", "webp"}

def allowed_file(name):
    return "." in name and name.rsplit(".", 1)[1].lower() in ALLOWED

def parse_tags(raw):
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(t).strip() for t in raw if str(t).strip()]
    return [t.strip() for t in str(raw).split(",") if t.strip()]

def json_body():
    return request.get_json(silent=True) or {}

def ok(**payload):
    return jsonify({"success": True, **payload})

def fail(message, status=400):
    return jsonify({"success": False, "message": message}), status

def current_user_id():
    data = json_body()
    return (
        request.headers.get("X-User-Id")
        or request.args.get("userId")
        or data.get("userId")
        or request.form.get("userId")
    )

def current_user_name():
    data = json_body()
    return (
        request.headers.get("X-User-Name")
        or request.args.get("userName")
        or data.get("userName")
        or request.form.get("userName")
    )

@app.route("/")
def index():
    try:
        posts = [p for p in db.list_posts() if p.get("published")]
    except Exception as e:
        posts = []
        flash(str(e))
    return render_template("index.html", posts=posts)

@app.route("/posts")
def all_posts():
    try:
        posts = db.list_posts()
    except Exception as e:
        posts = []
        flash(str(e))
    return render_template("posts.html", posts=posts)

@app.route("/posts/new", methods=["GET", "POST"])
def new_post():
    if request.method == "GET":
        return render_template("post_form.html", post=None)

    title = request.form.get("title", "").strip()
    content = request.form.get("content", "").strip() or request.form.get("body", "").strip()
    category = request.form.get("category", "").strip()
    tags = parse_tags(request.form.get("tags", ""))
    published = request.form.get("published") == "on"
    image_url = None

    if not title or not content:
        flash("Title and content are required")
        return render_template("post_form.html", post=None)

    file = request.files.get("image")
    if file and file.filename and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        name = f"{uuid.uuid4().hex}.{ext}"
        try:
            image_url = db.upload_file(file.read(), name, file.mimetype)
        except Exception as e:
            flash(f"Image upload failed: {e}")

    try:
        post = db.create_post(
            title,
            content,
            category,
            tags,
            image_url,
            published,
            user_id=request.form.get("userId"),
            user_name=request.form.get("userName") or "Anonymous",
        )
        return redirect(url_for("view_post", post_id=post["id"]))
    except Exception as e:
        flash(str(e))
        return render_template("post_form.html", post=None)

@app.route("/posts/<post_id>")
def view_post(post_id):
    try:
        post = db.get_post(post_id)
        comments = db.list_comments(post_id)
    except Exception as e:
        flash(str(e))
        return redirect(url_for("index"))
    return render_template("post_detail.html", post=post, comments=comments)

@app.route("/posts/<post_id>/edit", methods=["GET", "POST"])
def edit_post(post_id):
    try:
        post = db.get_post(post_id)
    except Exception as e:
        flash(str(e))
        return redirect(url_for("all_posts"))

    if request.method == "GET":
        return render_template("post_form.html", post=post)

    title = request.form.get("title", "").strip()
    content = request.form.get("content", "").strip() or request.form.get("body", "").strip()
    category = request.form.get("category", "").strip()
    tags = parse_tags(request.form.get("tags", ""))
    published = request.form.get("published") == "on"
    image_url = post.get("imageUrl")

    file = request.files.get("image")
    if file and file.filename and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        name = f"{uuid.uuid4().hex}.{ext}"
        try:
            image_url = db.upload_file(file.read(), name, file.mimetype)
        except Exception as e:
            flash(f"Image upload failed: {e}")

    try:
        db.update_post(post_id, title, content, category, tags, image_url, published)
        return redirect(url_for("view_post", post_id=post_id))
    except Exception as e:
        flash(str(e))
        return render_template("post_form.html", post=post)

@app.route("/posts/<post_id>/delete", methods=["POST"])
def remove_post(post_id):
    try:
        db.delete_post(post_id)
    except Exception as e:
        flash(str(e))
    return redirect(url_for("all_posts"))

@app.route("/posts/<post_id>/comments", methods=["POST"])
def comment(post_id):
    author = request.form.get("author", "Anonymous").strip() or "Anonymous"
    text = request.form.get("content", "").strip() or request.form.get("body", "").strip()
    if text:
        try:
            db.add_comment(post_id, author, text)
        except Exception as e:
            flash(str(e))
    return redirect(url_for("view_post", post_id=post_id))

@app.route("/api/posts", methods=["GET"])
def api_list_posts():
    try:
        posts = db.list_posts(user_id=current_user_id())
        return ok(posts=posts)
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/posts", methods=["POST"])
def api_create_post():
    data = json_body()
    title = (data.get("title") or "").strip()
    content = (data.get("content") or data.get("body") or "").strip()
    category = (data.get("category") or "").strip()
    tags = parse_tags(data.get("tags"))
    published = bool(data.get("published", True))
    image_url = data.get("imageUrl") or data.get("image_url")
    user_id = current_user_id()
    user_name = current_user_name() or "Anonymous"

    if not title or not content:
        return fail("Title and content are required")
    if not user_id:
        return fail("userId is required")

    try:
        post = db.create_post(
            title,
            content,
            category,
            tags,
            image_url,
            published,
            user_id=user_id,
            user_name=user_name,
        )
        return ok(message="Created", post=post), 201
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/posts/<post_id>", methods=["PUT"])
def api_update_post(post_id):
    data = json_body()
    title = (data.get("title") or "").strip()
    content = (data.get("content") or data.get("body") or "").strip()
    category = (data.get("category") or "").strip()
    tags = parse_tags(data.get("tags"))
    published = bool(data.get("published", True))
    image_url = data.get("imageUrl") if "imageUrl" in data else data.get("image_url")

    if not title or not content:
        return fail("Title and content are required")

    try:
        post = db.update_post(
            post_id,
            title,
            content,
            category,
            tags,
            image_url,
            published,
            user_id=current_user_id(),
        )
        if not post:
            return fail("Post not found", 404)
        return ok(message="Updated", post=post)
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/posts/<post_id>", methods=["DELETE"])
def api_delete_post(post_id):
    try:
        db.delete_post(post_id)
        return ok(message="Deleted")
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/posts/<post_id>/like", methods=["POST"])
def api_toggle_like(post_id):
    user_id = current_user_id()
    if not user_id:
        return fail("userId is required")
    try:
        result = db.toggle_like(post_id, user_id)
        return ok(**result)
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/posts/<post_id>/comments", methods=["GET"])
def api_list_comments(post_id):
    try:
        comments = db.list_comments(post_id)
        return ok(comments=comments)
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/posts/<post_id>/comments", methods=["POST"])
def api_add_comment(post_id):
    data = json_body()
    content = (data.get("content") or data.get("body") or "").strip()
    author = (data.get("author") or current_user_name() or "Anonymous").strip()
    user_id = current_user_id()

    if not content:
        return fail("content is required")

    try:
        comment = db.add_comment(post_id, author, content, user_id=user_id)
        return ok(message="Created", comment=comment), 201
    except Exception as e:
        return fail(str(e), 500)

@app.route("/api/users/<user_id>/posts", methods=["GET"])
def api_user_posts(user_id):
    try:
        posts = db.list_posts_by_user(user_id, user_id=current_user_id())
        return ok(posts=posts)
    except Exception as e:
        return fail(str(e), 500)

if __name__ == "__main__":
    app.run(debug=True)
