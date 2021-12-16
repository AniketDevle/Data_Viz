# Analysis of Newspaper Propaganda Biases

We present a system which visualizes newspaper biases on the basis of propaganda techniques using PRTA API. The system is an unbrella containing two applications, a JS frontend powered by d3.js and a flask backend.

The JS frontend can be hosted on a simple live server. We recommend a VS code live server or a live python http server using
```sh
python3 -m http.server [PORT NUMBER]
```

For BE, the following packages need to be installed:<br/>
 - flask
 - flask-cors
 - numpy
 - pandas
 - scikit-learn
 - scipy
 - spacy
 - nltk
 
Spacy and NLTK require further packages which can be installed by running
```sh
python -m spacy install en_core_web_sm
python -m nltk install stopwords
```
To run BE, run
```sh
flask run
```
The backend abstracts the following APIs
 - /<search_criteria>
 - /article/<article_id>

## Files

All of the shared files are in the [Drive folder](https://drive.google.com/drive/folders/1Qwv4Kl1IPNj0NpoSsEUbnG8hqwUu0waB?usp=sharing).  
Anyone not in the group will need to request access.

Original Kaggle data of the "All the News" dataset are the files: `articles.csv`, `articles2.csv` and `articles3.csv`

The preprocessed data that we will be using (for now) is: `articles1-pp.csv`  
I have populated it with random score instances for now:
<img src="preprocessing/How the csv data looks like.png" style="border:black; border-width:1px; border-style:solid;"  alt="How the csv data looks like"/>

Install the data files and store them in a directory named 'archive' in the project directory.
With this, you are all set!

Cheers!