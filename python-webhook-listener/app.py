import os
import subprocess
import json
from flask import Flask, jsonify, request


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

        #print(data)
        token = request.args.get('token')
        environmentToken = os.getenv('DOCKER_TOKEN')
        #print(token)
        #print(environmentToken)

        try:
            environment = data['push_data']['tag']
        except Exception as e:
            print('error, could not deploy', e)
            return jsonify(success=False), 500

        if str(token) == environmentToken:
            subprocess.call(f'./script.sh {environment}', shell=True)
            return jsonify(success=True)

        return jsonify(success=False), 500

    if request.method == 'GET':
        return "i am listening!"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
