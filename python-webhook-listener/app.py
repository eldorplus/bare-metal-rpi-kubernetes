import os
import subprocess
import json
from flask import Flask, jsonify, request
from waitress import serve


app = Flask(__name__)


# @app.route('/')
# def index():
# return 'Test!'


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        data = request.get_json()

        if data is None:
            data = json.loads(request.get_data())

        # print(data)
        token = request.args.get('token')
        environmentToken = os.getenv('DOCKER_TOKEN')
        # print(token)
        # print(environmentToken)

        try:
            environment = data['push_data']['tag']
            repo = data['repository']['repo_name']
        except Exception as e:
            print('error, could not deploy', e)
            return jsonify(success=False), 500

        if str(token) == environmentToken:
            subprocess.call(f'./script.sh {environment} {repo}', shell=True)
            return jsonify(success=True)

        return jsonify(success=False), 500

    if request.method == 'GET':
        return "i am listening!"


if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=8000, debug=True)
    serve(app, host='0.0.0.0', port=8000)
