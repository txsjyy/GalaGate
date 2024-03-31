from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

users = {
    'user1@example.com': {'lottery_number': 123, 'won': 'yes'},
    'user2@example.com': {'lottery_number': 456, 'won': 'no'},
    'user3@example.com': {'lottery_number': 1, 'won': 'no'},
    'user4@example.com': {'lottery_number': 2, 'won': 'no'},
    'user5@example.com': {'lottery_number': 3, 'won': 'no'},
    'user6@example.com': {'lottery_number': 4, 'won': 'no'},
    'user7@example.com': {'lottery_number': 5, 'won': 'no'},
}


@app.route('/api/checkin', methods=['POST'])
def checkin():
    # Parse the incoming JSON request to extract the email
    data = request.json
    email = data.get('email')

    # Search for the email in the dictionary
    if email in users:
        user_data = users[email]
        exist = True
        lottery_number = user_data['lottery_number']
        won = user_data['won']
    else:
        exist = False
        lottery_number = -1  # Using -1 to indicate not found or not applicable
        won = 'not applicable'

    # Respond with the data
    return jsonify({
        'exist': exist,
        'lottery_number': lottery_number,
        'won': won
    })

@app.route('/api/lottery-numbers', methods=['GET'])
def get_lottery_numbers():
    # Extract lottery numbers excluding those with a won value of 'yes'
    lottery_numbers = [user['lottery_number'] for user in users.values() if user['won'] != 'yes']

    # Return the list of lottery numbers
    return jsonify(lottery_numbers)

# debug=True to avoid restart the local development server manually after each change to your code.
# host='0.0.0.0' to make the server publicly available.
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0',port=8080)