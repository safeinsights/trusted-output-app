# Welcome to the trusted output app

## This application is responsible for:

-   Receiving a CSV file from the research container with the results of the code run
-   Saving that CSV to memory (TBD) for the lifespan of this container
-   Allowing members(TM) to log in and approve the results of the code run (AKA the CSV files)
-   Once the members approve the results, this application will post the CSV file to the management app (Endpoint TBD)

## To list your AWS profiles before pushing the image:

-   `aws configure list-profiles`

## To push image to ECR

-   `aws sso login --profile your-profile`
-   `AWS_PROFILE=your-profile AWS_REGION=your-region npm run deploy:ecr`
