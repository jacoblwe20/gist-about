<img src="https://raw.githubusercontent.com/jacoblwe20/pastila/master/app/icons/logo.png" width="100" height="100" >
# Pastila

[![Greenkeeper badge](https://badges.greenkeeper.io/jcblw/pastila-nw.svg)](https://greenkeeper.io/)

Pastila is a small app that edits Markdown files and then syncs them up with Github accounts.

## Installing

Clone this repo and in the root directory run `npm install` to install depedencies. To then startup the app run `npm start` this should open up the window and display a new page for the app.

## Authing Github Account

to get a personal access token go to you github account settings 

```
Applications > Personal Access Tokens > Generate New Token
``` 

You will need to give the application access to `gist` and `user` these should be on by default.

![Permissions](https://photos-3.dropbox.com/t/0/AABFEDTXmSvaI8OZ_d2JL4iCfuJK7laXEyo_iSRalD1b8Q/12/14615376/png/1024x768/3/1395633600/0/2/Screenshot%20from%202014-03-23%2018%3A41%3A49.png/ra_hm-dIBksjn8reXOA_Ty9cMZaz135e3aw82nKG9is)

Generate Token the paste into the `auth.json` file.

you will need to create a file called `auth.json` in you user aplication storage directory. 

```
# linux
cd ~/.pastila
# mac
cd ~/Library/Application Support/.pastila
```

in that file youll need to put a github personal access token
```json
{
	"authToken" : "{{personalAccessToken}}"
}
```


### Notes

Linux : http://askubuntu.com/questions/330935/error-while-loading-shared-libraries

