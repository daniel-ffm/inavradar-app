# INAVradar-APP
Debugging app for INAVradar-ESP32

Download and install node.js LTS:
https://nodejs.org/en/

Download and install Java 1.8:
http://www.oracle.com/technetwork/java/javase/downloads

Download and install Android Studio:
https://developer.android.com/studio/install
Start studio, click thru the setup wizard.
In the welcome panel, Configure->SDK manager and install SDK version 18.

```
git clone https://github.com/daniel-ffm/inavradar-app
cd inavradar-app
npm install -g cordova
npm install
cordova platform add android
cordova build android
```
