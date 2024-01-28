import requests
from flask import Flask, render_template

app = Flask(__name__)

endpoint = 'https://the-trivia-api.com/v2/questions'

# List of categories and difficulties
categories_list = ['music', 'sport_and_leisure', 'film_and_tv', 'arts_and_literature', 'history', 'science']
difficulties_list = ['easy', 'medium', 'hard']

# Nested dictionary to store questions by category and difficulty
questions_by_category_and_difficulty = {category: {difficulty: [] for difficulty in difficulties_list} for category in categories_list}

# Iterate through the categories
for category in categories_list:
    # Iterate through the difficulties for each category
    for difficulty in difficulties_list:
        # Define query parameters
        params = {
            'categories': category,
            'limit': 2 if difficulty != 'hard' else 1,  # Adjust the limit based on difficulty
            'difficulty': difficulty
        }

        # Make the API request
        response = requests.get(endpoint, params=params)

        # Check if the request was successful
        if response.status_code == 200:
            # Parse and use the response JSON data
            questions_data = response.json()

            # Store questions in the nested dictionary
            questions_by_category_and_difficulty[category][difficulty] = questions_data

# Render HTML template with Flask
# @app.route('/')
# def render_table():
#     return render_template('table_template.html', categories=categories_list, difficulties=difficulties_list, questions=questions_by_category_and_difficulty)

# if __name__ == '__main__':
#     app.run(debug=True)
