git clone https://github.com/wasi-master/13ft.git
cd 13ft/app

python3 -m venv venv
source venv/bin/activate

python -m pip install -r requirements.txt
FLASK_APP=app/portable.py flask run --host=127.0.0.1 --port=9982