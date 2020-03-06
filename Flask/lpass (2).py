#!/usr/bin/python

import atexit
from apscheduler.scheduler import Scheduler
from nltk.corpus import stopwords
cachedStopWords = stopwords.words("english")
from flask import Flask, jsonify, request, render_template

from flask_cors import CORS, cross_origin
import json
import requests


app = Flask(__name__)
# cors = CORS(app)
# json = FlaskJSON(app)


cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
    
    
application = app # our hosting requires application in passenger_wsgi

@app.route("/api/v2/green", methods=['GET', 'POST','OPTIONS'])
@cross_origin()
def green():
    if request.method == 'POST':
        try:
            watts = request.form['watts']
            hours = request.form['hours']
            label = request.form['label']
        except KeyError:
            pass
    kwh = (watts*hours)/1000
    
    url = "https://api.cloverly.com/2019-03-beta/purchases/electricity"
    
    payload = "{\"energy\":{\"value\":"+str(kwh)+",\"units\":\"kwh\"}}"
    headers = {
      'Content-type': 'application/json',
      'Authorization': 'Bearer public_key:47800ea0ee541b4c'
    }
    
    response = requests.request("POST", url, headers=headers, data = payload)
    
    #response.text.encode('utf8')
    return jsonify(response.json()), 200


@app.route("/api/v2/test", methods=['GET', 'POST','OPTIONS'])
def job_function():
    import pandas as pd
    import os
    import datetime as dt
    with open("filelist.txt",'a+') as f:
        f.seek(0)
        filelist = f.read()
        f.seek(0)
        f.truncate()
        f.write("Files Recently Updated")
        now = dt.datetime.now()
        ago = now-dt.timedelta(hours=8)
        files_today = []
        for root, dirs,files in os.walk('responses'):  
            for fname in files:
                path = os.path.join(root, fname)
                st = os.stat(path)    
                mtime = dt.datetime.fromtimestamp(st.st_mtime)
                if mtime > ago:
                    #if file is not in yesterdays file list
                    
                    # f.write('\n%s modified %s'%(path, mtime))
                    if(path not in filelist):
                        response = pd.read_csv(path)
                        username = path.split('/')[1].split('_')[0]
                        jsonify(trainai(username=username,internal=True,data=response))
                        
                        f.write('\n%s modified %s'%(path, mtime))
                        files_today.append(path)
                        # hello()
        
    return jsonify("Files Updated: "+" ------- ".join(files_today))


# Shutdown your cron thread if the web process is stopped
atexit.register(lambda: cron.shutdown(wait=False))

@app.route("/api/v2/users", methods=['GET', 'POST','OPTIONS'])
def hello():
    import os
    relevant_path = "users/"
    included_extensions = ['json']
    file_names = [fn.split(".")[0] for fn in os.listdir(relevant_path)
                  if any(".user" in fn for ext in included_extensions)]
    
    return jsonify(file_names), 200
    
@app.route("/api/v2/watched", methods=['GET', 'POST','OPTIONS'])
def watched():
    import json
    retrain = None
    if request.method == 'POST':
        try:
            retrain = request.form['retrain']
        except KeyError:
            pass
        feedback = request.form['feedback']
    feedback = json.loads(feedback)
    import pandas as pd
    # return jsonify(feedback["username"]+"_Response.csv")
    
    response = pd.read_csv("responses/"+feedback["username"]+"_Response.csv")
    response.loc[response["tmdbId"]==feedback["tmdbId"],"like"] = feedback["like"]
    response.to_csv("responses/"+feedback["username"]+"_Response.csv")
    
    predications = pd.read_json("../public_html/assets/predictions/"+feedback["username"]+"-Predictions.json")
    predications = predications[predications["tmdbId"]!=feedback["tmdbId"]]
    predications.to_json("../public_html/assets/predictions/"+feedback["username"]+"-Predictions.json",orient='records')
    
    
    if(retrain):
        trainai(username=feedback["username"],data=response["tmdbId","like"])
    
    
    
    return jsonify("success"), 200

@app.route("/api/v2/pirate", methods=['GET', 'POST','OPTIONS'])
def pirate():
    if request.method == 'POST':
        title = request.form['title']
    import re
    
    def stripwords(text):
      text = text.lower()
      text = re.sub('[^\w\s\d-]','',text)
      text1 = '-'.join([word for word in text.split() if word not in cachedStopWords])
      text2 = '-'.join([word for word in text.split()])
      return [text1,text2]
      
    test = stripwords(title)
    return jsonify(test), 200

@app.route("/api/v2/combine", methods=['GET', 'POST','OPTIONS'])
def combine():
    
    import pandas as pd
    import json
    if request.method == 'POST':
        users = request.form['users']
    
    users = json.loads(users)
    if(len(users)==1):
        return jsonify(users[0]["name"])
    import pandas as pd
    
    group = pd.util.testing.rands(5)
    dfs = []
    for user in users:
        data = pd.read_json("../public_html/assets/predictions/"+user["name"]+"-Predictions.json")
        dfs.append(data)
    for i,df in enumerate(dfs):
        ans = df["answer"]
        df["answer"]=(ans-ans.min())/(ans.max()-ans.min())
    combined = pd.concat(dfs)
    combined = combined.rename(columns={"answer": "answers"})
    final = pd.DataFrame()
    final["answer"] = combined.groupby(['tmdbId'])['answers'].sum()#
    final["count"] = combined.groupby(['tmdbId']).size()
    combined = final.merge(combined,how="left",on="tmdbId").sort_values(by=['count', 'answer'], ascending=False)
    
    combined = combined.drop_duplicates(subset ="tmdbId", 
                     keep = "first")

    combined.iloc[0:200,:].to_json("../public_html/assets/predictions/"+group+"-Predictions.json",orient='records')
    
    combined.iloc[0:400,:].to_csv("predictions/"+group+"-Predictions.csv")
    
    return jsonify(group)





@app.route("/api/v2/test_response", methods=['GET', 'POST','OPTIONS'])
def trainai(username=None,data=None,internal=False):
    if request.method == 'POST':
        try:
            data = request.form['data']
            username = request.form['username']
        except:
            pass
    import pandas as pd
    import json
    from datetime import datetime
    # current date and time
    now = datetime.now()
    if(not internal):
        data = json.loads(data)
        json={'selection':data}
        user = pd.DataFrame(json['selection'],columns=["tmdbId","like"])
    else:
        user = data
        
    
    
    user.to_csv("responses/"+username+"_Response.csv")
    movies = pd.read_csv(r"movies3.csv")
    omovies = user.merge(movies,on="tmdbId",how="right")
    try:
        omovies = omovies.drop(columns=["cast","crew"])
    except:
        pass
    final = movies.drop(columns=["release_date","poster_path","budget","imdb_id","runtime","tagline","title"])
    final = user.merge(final,on="tmdbId",how="right")
    omovies = omovies[omovies["like"].isna()].copy()
    
    # return str(username) 
    
    
    # %%
    def AI(movie_data,ai,target,username,original_data):
        #%%
        import math
        import numpy as np
        import re
        import nltk
        # from sklearn.datasets import load_files
        # nltk.download('stopwords')
        import pickle
        # from nltk.corspus import stopwords
        import sklearn
        import time
        #%%
        import pandas as pd
        # movie_data = pd.read_csv(r"C:\Users\Dejan Stajic\Documents\GitHub\AI\incidentsplit.csv")
        # movie_data = pd.read_csv(r"C:\Users\Dejan Stajic\Documents\the-movies-dataset\moviesriznershort.csv")
        # movie_data = movie_data.dropna()
        
        movie_data.shape
        #%%
        # target = 'assignment_group'
        y = movie_data.loc[movie_data[target].notna(),target]
        cols = movie_data.columns.values.tolist()
        cols.remove(target)
        #%%
        # movie_data.fillna(0)
        
        movie_data.dtypes
        floats = []
        strings = []
        for col in movie_data[cols].columns:
            try:
                movie_data[col] = movie_data[col].astype(float)
                floats.append(col)
            except:
                movie_data[col] = movie_data[col].astype(str)
                strings.append(col)
            time.sleep(1)
        
        #%%
        #remove non /w and /s
        movie_data[strings] = movie_data[strings].replace( "[^\sa-zA-Z]", "" ,regex=True)
        movie_data[floats] = movie_data[floats].fillna(0)
        #clean target column if it is not floats
        try:
            movie_data[target] = movie_data[target].astype(float)
        except:
            movie_data[target] = movie_data[target].replace( "[^\sa-zA-Z]", "" ,regex=True)
            
        for col in strings:
            movie_data[col] = movie_data[col].str.slice(0,100)
        X_data = movie_data.loc[movie_data[target].notna(),cols].fillna(0)
        X_unknown = movie_data.loc[movie_data[target].notna() == False,cols].fillna(0)
        
        
        #%%
        from sklearn import preprocessing
        le = preprocessing.LabelEncoder()
    
        def to_category(series):
            series = series.to_list()
            le.fit(series)
            list(le.classes_)
            y_encoded = le.transform(series)
            return y_encoded
           
        Y = to_category(y)
        
        from sklearn.feature_extraction import text
        from sklearn.feature_extraction.text import TfidfVectorizer
        #WORKS
        #%%
        def train_tokenizer(dataframe):
            # stopwords.words('english')
            my_stop_words = text.ENGLISH_STOP_WORDS.union(["id","castid", "character", "creditid", "gender", "art", "camera", "creditid", "david", "department","music", "order", "profilepath", "directing", "director", "editing", "editor", "job",'backdroppath', 'collection', 'posterpath'])
            vectorizer = TfidfVectorizer(max_features=2000, stop_words=my_stop_words)
    
            vectorizer.fit(dataframe.values.reshape(-1,).tolist())
            return vectorizer
    
    
        #%%
        #make a bunch of columns and fill them with 0s fillna(0)
        
        def NumToToken(col):
            # t0 = time.time()
            test = col
            test = test
            try:
                test = test.reset_index().drop(columns=["index"])
                test = test.reset_index().drop(columns=["level_0"])
            except:
                pass
            test1 = vectorizer.transform([strings[0]]).toarray() #0 time
            zeros = pd.DataFrame(0,index=np.arange(0,len(test)),columns = np.arange(len(test1[0]))) # 1.6 sec
            for col in zeros.columns:
                zeros[col].values[:] = 0
            zeros.iloc[:,0] = test.iloc[:,0] # 0 time
            return zeros.to_numpy()
    
        #%%
    
        # NumToToken(Xs[col])
    
        # test3 = pd.DataFrame(X[0].tolist())
        #%%
        vectorizer = train_tokenizer(movie_data[strings])
        X = []
        for col in X_data.columns:
            try:
                X.append(vectorizer.transform(X_data[col]).toarray())
            except:
                X.append(NumToToken(X_data[col]))
                # pass
        
        # X[0]
        # y = X.pop()
        # del movie_data
        #%%
        type(X[0])
        #%%
        #TODO fix memory error
        X = np.array(X)
        
        # return X
        x = np.transpose(X, (1, 2, 0))
        # x[np.isnan(x)]=0
        #work
        #%%
        from sklearn.model_selection import train_test_split
    
        # ai = 'classifier'
        # ai = 'classifier'
        if(ai == 'regressor'):
            X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=None)
        else:
            X_train, X_test, y_train, y_test = train_test_split(x, Y, test_size=0.2, random_state=None)
        X_train.shape
        
        #%%
        #work
        train_nsamples, train_nx, train_ny = X_train.shape
        X_train = X_train.reshape((train_nsamples,train_nx*train_ny))
        
        nsamples, nx, ny = X_test.shape
        X_test = X_test.reshape((nsamples,nx*ny))
        # return Y,y_train,y_test
        # return (X_train)
        #%%
        #brokemn
        
        # return "works"
        if(ai == 'regressor'):
            from sklearn.ensemble import RandomForestRegressor
            regressor = RandomForestRegressor(n_estimators=150,n_jobs=-1, random_state=None)
            regressor.fit(X_train, y_train) 
        else:
            from sklearn.ensemble import RandomForestClassifier
            classifier = RandomForestClassifier(n_estimators=150, n_jobs=-1,random_state=None)
            classifier.fit(X_train, y_train) 
    
        # return "works"
    
    
        if(ai=="classifier"):
            with open("models/"+username+'_classifier', 'wb') as picklefile:
                pickle.dump(classifier,picklefile)
            with open("models/"+username+'_classifier', 'rb') as training_model:
                model = pickle.load(training_model)
        else:
            with open("models/"+username+'_regressor', 'wb') as picklefile:
                pickle.dump(regressor,picklefile)
            with open("models/"+username+'_regressor', 'rb') as training_model:
                model = pickle.load(training_model)
        
        def Predict(Xs,ai,original_data):
            import time
    
            t0 = time.time()
            batch_size = 200
            # Xs = X_train
            movie_data = Xs
            y_pred3 = np.empty((0,1),int)
            x_final = np.empty((0,len(Xs.columns)))
    
            for a in range((len(Xs)//batch_size)+1):
                Xs = movie_data.iloc[a*batch_size:(a+1)*batch_size,:]
                Xs = Xs.reset_index()
    
                try:
                    Xs = Xs.drop(columns=["level_0"])
                except:
                    pass
                try:
                    Xs = Xs.drop(columns=["index"])
                except:
                    pass
                
                # vectorizer = train_tokenizer(Xs[strings])
                X = []
                #make a bunch of columns and fill them with 0s fillna(0)
                for col in Xs.columns:
                    try:
                        X.append(vectorizer.transform(Xs[col]).toarray())
                    except:
                        X.append(NumToToken(Xs[col]))
                        pass
                X = np.array(X)
                
                #(66, 1047, 12) 
                nsamples, nx, ny = np.transpose(X, (1, 2, 0)).shape
    
                x_reshaped1 = np.transpose(X, (1, 2, 0)).reshape((nsamples,nx*ny))
                #use model instead of regressor/classifier
                if(ai=='regressor'):
                    y_pred2 = regressor.predict(x_reshaped1)
                else:
                    y_pred2 = classifier.predict(x_reshaped1)
                
    
                y_pred3 = np.append(y_pred3,y_pred2)
    
            if(ai == 'classifier'):
                original_data["answer"] = list(le.inverse_transform(y_pred3))
            else:
                original_data["answer"] = y_pred3.tolist()#original_data
            
            
            original_data.sort_values(by='answer', ascending=False).iloc[0:300,:].to_json("../public_html/assets/predictions/"+username+"-Predictions.json",orient='records')
            with open("users/"+username+".user",'w+') as f:
                f.write("test")
            return original_data
    
        return Predict(X_unknown,ai,original_data)
        
        #TODO fix 20 second ish gap between rounds; takes longer as the file builds up
    
    final = AI(final,'regressor','like',username,omovies)
    return jsonify("success")
    # return render_template('index.html', message="complete")
    
@app.route("/home")
def lp():
    return("index.html")
    
    
# @app.errorhandler(500)
# def internal_error(error):
#     return jsonify(error)

if __name__ == "__main__":
    app.debug = True
    app.run()