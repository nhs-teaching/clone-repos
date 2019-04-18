# Clone Repositories #
Currently this script is fairly specific to how I use github organizations in
my AP Comp Sci class. 

## Install ##
Before running be sure to run `npm install`. 

You also need a CSV file of your class roster

| Name | Email             |  Github |
|------|-------------------|---------|
| Joe  | example@gmail.com | example |

Ensure that you have your access token (GITHUB_ACCESSTOKEN) and github username (GITHUB_UNAME) set 
to environment variables before running. 

## Running ##
The assumption is that your ogranization is named in the following way and the projects are using a 
gradle setup. However, this is pretty easy to change to ant or something else. 
`NHS-<year>-P<period number>-AP-Comp-Sci`
`node index.js <YEAR> <PERIOD> <PROJECT NAME> <PATH TO ROSTER FILE>

After running there should be a directory named `repos` that all your students repos is created under. 