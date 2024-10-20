# Build and Submit

*  [Prerequisites](#prerequisites)
*  [`git pull origin master`](#pulling)
*  [`yarn version --newVersion`](#versioning)
*  [`git push --follow-tags`](#pushing)
*  [`eas build -p ios --profile production --auto-submit`](#building-ios)
*  [`eas build -p android --profile production](#building-android)
*  [IOS Submission](#ios-submission)
*  [Android Submission](#android-submission)

## Prerequisites

To build, you must have the cli tool, and be logged in with your expo credentials.

*  `yarn global add eas-cli`
*  `eas login`
*  `eas --version`

Pro tip. Always run `eas --version`. If you are not on the latest version of EAS, it will show a warning and let you know what version it expects. To update, run `yarn global upgrade eas-cli --latest`. Then run `yarn global list` to verify you have the right version.

## Pulling

Before you create a version, be sure to pull in the latest main. It really sucks when you've tagged locally, generated a changelog, and then you're not able to push because you've diverged from origin/main. Do the right thing. Pull first.

## Versioning

This is the most important step. The version, and buld number are separated by a dash. Lots of things depend on this. Run `yarn version --newVersion`. You should see a prompt, showing the oldVersion, and an input asking for the newVersion. _Always increment the buildNumber_. Android rejects any build numbers that have been previously used. We only bump the version after a release. _IOS will reject builds with versions lower than the current release._

Example:

```
$>yarn version --newVersion  
yarn version v1.22.19
info Current version: 1.1.9-1055
question New version: 
```

## Pushing

Always push the new tag back to gitlab. `git push origin main --follow-tags` or even `git push --follow-tags` will work. This triggers a pipeline that will have manual jobs for building and submittin. ( These jobs don't work yet - the prerequisite step is broken on gitlab. )

## Building IOS

Triggering the IOS job is easier than ever. Run `eas build -p ios --profile production --auto-submit`. This can take ~30 minutes to run. Some prompts will pop up and ask for your apple credentials. if you have the proper certs through apple, you should be able to build and submit. If you do not have the proper certs, expo can manage them for you.

Next, sign in to app store connect, [go to the classmates / testflight tab](https://appstoreconnect.apple.com/apps/1592740369/testflight/ios), find your build, and fill out the compliance questionaire. The answers are yes, and yes, then click start internal testing. Your build will turn yellow, and say 'ready to submit'

Finally, assign testers. On the testflight page, find your build, and go to the groups column. Click the +, and add the external group, mobile testers. Your build should turn green, and say 'ready to test'.

This build is now available on testflight. 

## Building Android

Find your build on [expo build dashboard](https://expo.dev/accounts/classmates/projects/classmates-mobile-app/builds) and download it. Then go to the [Android console](https://play.google.com/console/u/0/developers/5717605310474994009/app/4976088412486523849/tracks/4700879224032964819?tab=releases), and create a new release. Upload your build, and add notes from the Changelog. Click Review Release at the bottom of the page. Then go to the testers page, and copy the test link at the bottom. 

## IOS Submission

## Android Submission
