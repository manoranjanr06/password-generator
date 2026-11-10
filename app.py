from flask import Flask, render_template, send_from_directory

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


# The service worker must be served from the site root to control the whole app.
@app.route("/service-worker.js")
def service_worker():
    resp = send_from_directory(app.static_folder, "service-worker.js")
    resp.headers["Cache-Control"] = "no-cache"
    return resp


if __name__ == "__main__":
    app.run(debug=True)
