from flask import Flask, redirect, render_template, request, flash, session, g, jsonify
from datetime import datetime
from models import db, User, Game, connect_db
from forms import RegisterUser, LoginUser, EditUser
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
app.config['SECRET_KEY'] = "abcdef"
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///gameshow'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.debug = True

CURR_USER_KEY = "curr_user"

connect_db(app)
"""uncomment to seed"""
# with app.app_context():
#     db.create_all()

##############################################################################
# User signup/login/logout
@app.before_request
def add_user_to_g():
    """If logged in add curr user to Flask global."""
    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])
    else:
        g.user = None


def do_login(user):
    """Log in user."""
    session[CURR_USER_KEY] = user.id


def do_logout():
    """Logout user."""
    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]

# redner home page or if user is logged in, redirect to profile
@app.route('/')
def home():
    if g.user:
        return redirect (f'/{g.user.id}/profile')
    else:
        return render_template ('home-anon.html')

# render login page and allow user to login
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginUser()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        user = User.authenticate(username, password)
        if user:
            do_login(user)
            flash(f"Hello, {user.username}!", "success")
            return redirect(f'/{user.id}/profile')
    else:
        return render_template('login.html', form=form)

  
    return redirect ('/')


@app.route('/<int:user_id>/gameboard')
def gameboard(user_id):
    if not g.user:
        flash("Access unauthorized.", 'danger')
    return render_template('gameboard.html' , user=user_id)


@app.route('/<int:user_id>/profile')
def profile(user_id):
    if not g.user:
        flash("Access unauthorized.", 'danger')
        return redirect("/")

    user = User.query.get_or_404(user_id)
    games = Game.query.filter_by(user_id=user_id).all()
    return render_template('profile.html', user=user, user_id=user_id, games=games)




@app.route('/get_user_data', methods=['GET'])
def get_user_data():
    if g.user:
        return jsonify({'money': g.user.money, 'gamesplayed': g.user.gamesplayed})
    else:
        return jsonify({'error': 'User not logged in'}), 401

@app.route('/update_user_data', methods=['POST'])
def update_user_data():
    if g.user:
        player_score = request.json.get('careerScore')
        total_games = request.json.get('totalGames')
        game_score = request.json.get('gameScore')
        # Update g.user.money and g.user.gamesplayed here
        g.user.money = player_score
        g.user.gamesplayed = total_games + 1

        db.session.commit()

        # Update the Game model
        gameboard = Game(user_id=g.user.id, score=game_score, timestamp=datetime.utcnow())
        db.session.add(gameboard)
        db.session.commit()

        return jsonify({"message": "User info updated successfully"})
    else:
        return jsonify({"message": "Access unauthorized"}), 403


# Route for leaderboard
@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    if not g.user:
        flash("Access unauthorized.", 'danger')
        return redirect("/")
# query all users and sort by money
    all_users = User.query.all()
    user = User.query.get_or_404(g.user.id)
    all_users = sorted(all_users, key=lambda x: x.money, reverse=True)

    return render_template('leaderboard.html', users=all_users, user=user)





#route for logout
@app.route('/logout')
def logout():
    do_logout()
    return redirect('/')

#route for register 
@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterUser()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        email = form.email.data
        try:
            user = User.signup(username, password, email)
            db.session.commit()
        except IntegrityError:
            flash("Username already taken", 'danger')
            return render_template('register.html', form=form)
        do_login(user)
        return redirect(f'/{user.id}/profile')  # Use user.id directly
    else:
        return render_template('register.html', form=form)

@app.route('/<int:user_id>/edit', methods=['GET', 'POST'])
def update_user(user_id):
    """Update user."""
    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")

    user = User.query.get_or_404(user_id)
    form = EditUser(obj=user)

    if form.validate_on_submit():
        if User.authenticate(user.username, form.password.data):
            user.username = form.username.data
            user.email = form.email.data
            db.session.commit()
            return redirect(f"/{user.id}/profile")
        flash("Password incorrect", "danger")

    return render_template('edit.html', user=user,form=form)

@app.route('/<int:user_id>/delete', methods=['POST'])
def delete_user(user_id):
    """Delete user."""
    if not g.user:
        flash("Access unauthorized.", "danger")
        return redirect("/")

    do_logout()
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

    return redirect("/")


if __name__ == '__main__':
    app.run()
