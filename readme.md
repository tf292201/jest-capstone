## Project Information

- **API:** [the-trivia-api.com/v2/questions](https://the-trivia-api.com/v2/questions)
- **Website:** [Jest-a-Gameshow](https://jest-a-gameshow.onrender.com)

### Front End User Experience

Jest-a-Gameshow creates a gameboard that displays six categories sourced from the-trivia-API, each containing five questions of increasing difficulty. JavaScript is utilized to construct the gameboard dynamically and attach event listeners to each question box. Upon clicking a box, an API request is triggered, with parameters determined by the category and question value. The API returns a question, along with three incorrect answers and one correct answer, necessitating a multiple-choice game format. When clicked, the question and randomly shuffled answers are presented in an overlay. Similar to traditional game shows, users can choose to answer the question or skip it by not attemping an answer. Correct answers increment the user's score by the question's value, while incorrect answers decrement it by that value. After completing a game, the user's score is displayed on a leaderboard alongside other users' career scores.

### User Flows

New users are greeted with a simple homepage featuring links to login or register. Upon registration with a username, password, and email, users can log in and access their profile page. The profile page features two tables: one displaying the total number of games played and career earnings, and the other showing individual game winnings with timestamps. Additionally, users can navigate to the leaderboard page to view rankings based on total winnings and games played. The menu also provides options to log out and edit the user's profile, including information updates or profile deletion. Lastly, users can access the gameboard from the menu, functioning as described above.

### Tech Stack

The backend technology of this app comprises a Python Flask web server communicating with a PostgreSQL database using SQLAlchemy. The database consists of two tables: users and games, connected by a one-to-many relationship via the user ID foreign key.

The Flask app dynamically renders HTML webpages from a base template using Jinja. Form inputs for registration, login, and profile updates were created using Flask-WTForms, with form validators for email and length requirements. Authentication is implemented using Bcrypt in signup and login methods under the user class.