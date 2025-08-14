# AUCTIONEER - an online auction platform with telegram integration. Final Year Project (FYP)


CSIT321 - PROJECT

Project ID: CSIT-25-S2-12

Group ID: FYP-25-S2-23

Timothy (8750634), Saud (8576919), Shi Long (8552186), Qing Yuan (8561655), Raydon (8466385), Yang Run (7771642)

Assessor: Mr Premarajan

Supervisor: Mr Aaron Yeo

# Run
To run this app, you need these pre requisites
- secrets to GCP
- secrets to Terraform Cloud
- secrets to Supabase

This source code is not enough to run the app locally. This is a cloud native app with many micro services and dependencies.

Our technical document explains the codebase structure in depth



## File structure


```
├───backend
│   ├───controllers
│   ├───docs
│   ├───models
│   ├───routes
│   ├───ScheduledJob
│   └───utils
├───frontend
│   ├───favicon
│   └───src
│       ├───components
│       ├───mds
│       ├───pages
│       └───styles
├───images
├───notif
└───telegram
    └───handlers
```
Only ***backend*** and ***frontend*** is bundled into the main website docker image

***images*** are the fixed images we use such as website logo

***notif*** holds code for our notifications bot

***telegram*** holds code for our telegram bot