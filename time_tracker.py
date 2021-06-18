import pandas as pd
from datetime import datetime
from flask import Flask, render_template, request, json


DB_FILE = 'db/log.csv'
DB_HEADER = 'date,start_time,task_name,category,duration,end_time'

app = Flask(__name__)
db = None


def load_db(db_file=DB_FILE):
    try:
        fdb = open(db_file, 'r')
    except:
        fdb = open(db_file, 'w')
        fdb.write(DB_HEADER + '\n')
    fdb.close()

    db = pd.read_csv(db_file)

    return db


def save_db(db, db_file=DB_FILE):
    db.to_csv(db_file, index=False)


def data_for_date(date=None):
    if date is None:
        date = '{:%Y.%m.%d}'.format(pd.to_datetime('now'))

    tbl = db.loc[db['date'] == date]

    return tbl.iloc[::-1]


def init():
    global db

    if db is None:
        db = load_db()


@app.after_request
def add_header(r):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'

    return r


@app.route('/stop', methods=['POST'])
def stop_task():
    global db

    now = datetime.now()
    duration = request.json['duration']
    end_time = '{:%H:%M:%S}'.format(now)

    db.iloc[-1, db.columns.get_loc('duration')] = duration
    db.iloc[-1, db.columns.get_loc('end_time')] = end_time
    save_db(db)

    return json.dumps({'status': 'OK', 'duration': duration,
                       'end_time': end_time})


if __name__ == '__main__':
    app.run()

