## Inspiration
We noticed that on many social media outlets, especially Twitter, spam bots and other forms of content that users normally don't want to see are very common. We wanted to create a project that filters out these tweets, so that users can focus on what's important to them.

## What it does
This is a Google Chrome extension that is built to filter out unhelpful spam messages in order to allow users to gain quicker access to useful information on Twitter. It classifies what spam is by using google-compute-engine and various models we trained using Logistic Regression, Extreme Gradient Boosting, and Multi-Layer Perceptron.

We also incorporate user customization by allowing them to remove tweets that they do not want to see, which dynamically updates our classifier. We also let them enable "Thanos Mode," where instead of simply not displaying spam tweets, the tweets disintegrate into thin air.

## How We built it
Our project utilized four major components. The first of these was augmentation and data gathering, where we found data sets of labelled spam tweets. Then, we used these results to create word vectors, which were utilized as training and testing data for a few different classifiers. Next, we created a server on GCP, and hosted a model to classify tweets on fakeblock.org. We built a Chrome extension which sent tweets to the server to be classified, and then removed from the user's feed if they were classified as spam. Lastly, we optimized the server by caching classification results in Redis, and added the ability to dynamically update our classifier based on user input.

## Challenges We ran into
The major challenges for this project were finding data to train our classifier with and vectorizing this data in a way that was meaningful to the model. We were able to overcome these challenges by looking for research papers with datasets similar to ones we needed, and by utilizing spaCy to format this data into word vectors.

## Accomplishments that We're proud of
We are proud that we were able to integrate a Multi-Layer Perceptron Neural Network into a server hosted on Google Cloud Platform. We learned how to apply knowledge from various fields of computer science, including machine learning, web development, natural language processing, and cloud computing.  

## What We learned
Overall, we learned many concepts and technologies. We figured out how to create a functioning chrome extension that used communication with a server hosted on Google Cloud Compute Engine. We also learned how to apply machine learning ideas in a realistic setting, including evaluating different models and the horrors of collecting data.

## What's next for FakeBlock
In the future, we plan to incorporate multiple categories of spam. The user will be able to choose what type of content to filter in these categories. Also, we want to utilize ensemble learning of our classifiers, so that we can continuously improve our accuracy. Lastly, we plan to integrate this idea cross-platform, between different social media sites (such as Instagram, Facebook, etc). 
