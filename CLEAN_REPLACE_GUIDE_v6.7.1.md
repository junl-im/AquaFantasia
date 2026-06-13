# v6.7.1 Clean Replace Guide

Recommended: keep only `.git`, delete old files, extract this ZIP, commit and push.

This hotfix is focused on KakaoTalk in-app browser behavior. It avoids Fullscreen API and Screen Orientation API in Kakao-like shells because those WebViews can ignore or mishandle orientation locks.
