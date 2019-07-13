import os
import subprocess
from flask import Flask, jsonify, request


app = Flask(__name__)


# @app.route('/')
# def index():
# return 'Test!'


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        data = request.get_json()
        token = request.args.get('token')
        environment = data['tag']
        if str(token) == str(os.environ.get('DOCKERHUB_TOKEN')):
            subprocess.call(f'./script.sh {environment}', shell=True)
            return jsonify(success=True)
        return jsonify(success=False), 500
    if request.method == 'GET':
        return "i am listening!"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8008, debug=True)
