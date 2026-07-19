from flask import Flask, render_template, request, redirect, url_for, flash
from werkzeug.utils import secure_filename
import uuid
import db
import config

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

ALLOWED = {"png", "jpg", "jpeg", "gif", "webp"}

def allowed_file(name):
    return "." in name and name.rsplit(".", 1)[1].lower() in ALLOWED

def parse_tags(raw):
    if not raw:
        return []
    return [t.strip() for t in raw.split(",") if t.strip()]

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
    body = request.form.get("body", "").strip()
    category = request.form.get("category", "").strip()
    tags = parse_tags(request.form.get("tags", ""))
    published = request.form.get("published") == "on"
    image_url = None

    if not title or not body:
        flash("Title and body are required")
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
        post = db.create_post(title, body, category, tags, image_url, published)
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
    body = request.form.get("body", "").strip()
    category = request.form.get("category", "").strip()
    tags = parse_tags(request.form.get("tags", ""))
    published = request.form.get("published") == "on"
    image_url = post.get("image_url")

    file = request.files.get("image")
    if file and file.filename and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        name = f"{uuid.uuid4().hex}.{ext}"
        try:
            image_url = db.upload_file(file.read(), name, file.mimetype)
        except Exception as e:
            flash(f"Image upload failed: {e}")

    try:
        db.update_post(post_id, title, body, category, tags, image_url, published)
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
    text = request.form.get("body", "").strip()
    if text:
        try:
            db.add_comment(post_id, author, text)
        except Exception as e:
            flash(str(e))
    return redirect(url_for("view_post", post_id=post_id))

if __name__ == "__main__":
    app.run(debug=True)
