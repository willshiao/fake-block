import pandas as pd
import string
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle

whitelist = set(string.ascii_lowercase + string.digits)
encoder = None

# Load pickle
with open('thepickle.pkl', 'rb') as f:
    pickled = pickle.load(f)
    if len(pickled) == 2:
        vectorizer, classifier = pickled
    else:
        encoder, vectorizer, classifier = pickled
        

def cleanWord(word):
    word = "".join([c for c in word.lower() if c in whitelist])
    return word

def invalidWord(word):
    if (len(word) == 0 or word[0] == '@'):
        return True
    word = cleanWord(word)
    return len(word) == 0

def cleanText(text):
    words = text.split(" ")
    words = [cleanWord(word) for word in words if not invalidWord(word)]
    return ' '.join(words)

app = Flask(__name__)
CORS(app)

@app.route('/')
def test():
    return 'Hello! This is a test. - Jon'

@app.route('/classify', methods=['POST'])
def classify():
    content = request.get_json()
    docs = [cleanText(doc['text']) for doc in content]
    X = vectorizer.transform(docs)
    y_hat = classifier.predict(X)

    print('Get {} items'.format(len(content)))

    outputList = list()
    for i in range(len(content)):
        if (encoder is not None and encoder.classes_[y_hat[i]] != 'neither') or y_hat[i] == 1:
            print('Content: {}'.format(content[i]['text']))
            outputList.append(content[i]['id'])
            if encoder is not None:
                print('Predicted: {}'.format(encoder.classes_[y_hat[i]]))
            else:
                print('Predicted: {}'.format(y_hat[i]))
    return jsonify({ 'success': True, 'ids': outputList })
