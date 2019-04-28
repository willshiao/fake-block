import pandas as pd
import numpy as np
import redis
import os
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
import spacy

r = None
if 'REDIS_HOST' in os.environ:
    print('Redis settings found!')
    r = redis.Redis(host=os.environ['REDIS_HOST'])
else:
    print('REDIS_HOST not found... not using Redis')

nlp = spacy.load('en_vectors_web_lg', disable=['parser', 'tagger', 'ner', 'textcat'])

whitelist = set(string.ascii_lowercase + string.digits)
encoder = None
vectorizer = None

# Load pickle
with open('thepickle.pkl', 'rb') as f:
    pickled = pickle.load(f)
    if isinstance(pickled, list):
        if len(pickled) == 2:
            vectorizer, classifier = pickled
        else:
            encoder, vectorizer, classifier = pickled
    else:
        classifier = pickled

        

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

def vectorizeText(text):
    if not isinstance(text, str):
        print('Found error: {}, {}'.format(text, type(text)))
        text = str(text)
    output = np.zeros(300)
    doc = nlp(text)
    for tok in doc:
        output += tok.vector
    return output


app = Flask(__name__)
CORS(app)

@app.route('/')
def test():
    return 'Hello! This is a test. - Jon'

@app.route('/classify', methods=['POST'])
def classify():
    content = request.get_json()
    output_list = []
    docs = []

    if r is None:
        docs = content
    else:
        for i in range(len(content)):
            t_id = content[i]['id']
            if r.exists(t_id):
                print('Cache hit for {}'.format(t_id))
                if r.get(t_id) == 1:
                    output_list.append(t_id)
            else:
                docs.append(content[i])

    if len(docs) > 0:
        if vectorizer is not None:
            docs = [cleanText(doc['text']) for doc in docs]
            X = vectorizer.transform(docs)
            y_hat = classifier.predict(X)
        else:
            X = np.array([vectorizeText(doc['text']) for doc in docs])
            y_hat = classifier.predict(X)
    
    print('Got {} items'.format(len(docs)))

    for i in range(len(docs)):
        is_bad = (encoder is not None and encoder.classes_[y_hat[i]] != 'neither') or y_hat[i] == 1
        d_id = docs[i]['id']

        if is_bad:
            print('docs: {}'.format(docs[i]['text']))
            output_list.append(d_id)


            if encoder is None:
                print('Predicted: {}'.format(y_hat[i]))
            else:
                print('Predicted: {}'.format(encoder.classes_[y_hat[i]]))

        if r is not None:
            r.set(d_id, 1 if is_bad else 0)

    return jsonify({ 'success': True, 'ids': output_list })
