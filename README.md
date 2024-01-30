# used-tesla-finder
A small app that helps track used inventory and price movement

## Dependencies

```
Postgres
NodeJS
```

### Postgres

This project makes use a of a Postgres database, so you'll need to install Postgres on your system. The easiest way is by using Homebrew. Download homebrew by pasting and running this in your terminal:
```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

```brew install postgresql```

Now that you have Postgres installed, you'll need to create an empty database called `inventory`. Log into your Postgres CLI, and create it from there:

```
psql # this will launch the tool

CREATE DATABASE inventory;
```

And that's it for the postgres setup.

### Node

* [Node.js](http://nodejs.org/)

If you don't already have Node installed, download Node. If you want to switch between Node versions with ease, I recommend installing NVM(Node Version Manager) to enable you to switch between Node versions.


#### Node Installation via NVM

1. Install NVM: 
```
brew update
brew install nvm
mkdir ~/.nvm
echo "export NVM_DIR=~/.nvm" >> ~/.zshrc
echo "source $(brew --prefix nvm)/nvm.sh" >> ~/.zshrc
source ~/.zshrc
```

2. Install Node version 18 via NVM:

```
nvm install 18
nvm use 18
```

### Installation

```
cd [path-where-you-ran-git-clone]/used-tesla-finder
npm install
```

### Usage

```
`cd` into the project directory(wherever you git cloned this project)
npm run start
```

After running the final command, the chrome browser should open and navigate to the Tesla website. It is necessary to keep this browser window open for the entire duration of running this program as it is needed to scrape the inventory data from Tesla's servers. Every 5 minutes, a script running in the browser will scrape data into your database. If you keep the program running for long enough, you'll amass some pretty good historical data on what to expect in terms of used market pricing in your DB.

I recommend downloading [pgAdmin](https://www.pgadmin.org/download/pgadmin-4-macos/) for looking at your db in a GUI format.

### Notifications

One of the nice benefits of this program is that it has built-in alert notifications. There's no need to check your database every day if you have the notifications set up to alert you when a good deal comes your way. For this, we'll be using IFTTT to serve us push notifications.

There are 3 separate cases where a notification may be sent to you. When:

1. The price of a car changes
2. When a new car is added to inventory
3. When a car is removed from inventory

Of course, these notifications will be sent to you ONLY if the car matches your config.

#### IFTTT

1. Download the IFTTT app on your mobile phone(via App Store for iOS, via Play Store for Android). Make a free account.
2. Create a new applet
3. For the If This section, select "Webhooks". Name the webhook event name "send_tesla_text"
<p float="left">
  <img src="https://github.com/veryscarycary/used-tesla-finder/assets/16945851/cc026680-49be-4c9e-87f9-24afdc5636ce" width="200" height="350" />
  <img src="https://github.com/veryscarycary/used-tesla-finder/assets/16945851/637684e4-6344-4cbb-b3ae-88cd964357a3" width="200" height="350" />
  <img src="https://github.com/veryscarycary/used-tesla-finder/assets/16945851/07dded40-956a-4d32-a40e-b371f0c996ac" width="200" height="350" />
</p>
4. For the Then That section, select "Notifications". Click "add ingredient" to add the following values: "Value 1" "Value 2" and "OccurredAt". Create the action.
<p float="left">
  <img src="https://github.com/veryscarycary/used-tesla-finder/assets/16945851/712732a0-f133-47c0-a684-8fb84b556f27" width="200" height="350" />
  <img src="https://github.com/veryscarycary/used-tesla-finder/assets/16945851/ad314234-7087-45e5-b917-82a011c8b7da" width="200" height="350" />
</p>
5. Go to the [Webhooks service page](https://ifttt.com/maker_webhooks) and click Documentation. Copy your webhooks key at the top of the page.

Now, back in the project, make a copy of the .env.example file, but name it ```.env```. Paste your IFTTT Webhooks key after where it says IFTTT_KEY=

After this, you'll need to configure the .config.js file to notify you when a car matches your preferences.

#### Notifications Config

Make a copy of the .config.example.js file, but name it ```.config.js```. You can modify this new file to match your car preferences. In general, a notification will be sent to you if a car matches ALL of the values written in the config. If a preference in the config is '' or undefined, however, it will ignore those values.
