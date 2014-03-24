# Gist About

## Installing

Clone this repo and in the root directory run `npm install` to install depedencies. To then startup the app run `npm start` this should open up the window and display a new page for the app.

## Authing Github Account
https://www.dropbox.com/s/816ni8txa5bncdr/Screenshot%20from%202014-03-23%2018%3A41%3A49.png
to get a personal access token go to you github account settings 

```
Applications > Personal Access Tokens > Generate New Token
``` 

You will need to give the application access to `gist` and `user` these should be on by default.

Generate Token the paste into the `auth.json` file.

you will need to create a file called `auth.json` in you user aplication storage directory. 

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


### Notes

Linux : http://askubuntu.com/questions/330935/error-while-loading-shared-libraries

