# Gist About

## Installing

Clone this repo and in the root directory run `npm install` to install depedencies. To then startup the app run `npm start` this should open up the window and display a new page for the app.

## Authing Github Account

First you will need to create a file called `auth.json` in you user aplication storage directory. 

```
# linux
cd ~/.gist-about
# mac
cd ~/Library/Application Support/.gist-about
```

in that file youll need to put a github personal access token
```json
{
	"authToken" : "{{personalAccessToken}}"
}
```

to get a personal access token go to you github account settings 

### Notes

Linux : http://askubuntu.com/questions/330935/error-while-loading-shared-libraries

