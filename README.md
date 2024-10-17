# Welcome to the trusted output app

## This application is responsible for:

-   Receiving a CSV file from the research container with the results of the code run
-   Saving that CSV to memory (TBD) for the lifespan of this container
-   Allowing members(TM) to log in and approve the results of the code run (AKA the CSV files)
-   Once the members approve the results, this application will post the CSV file to the management app (Endpoint TBD)

## Hitting the upload endpoint:

```
curl -X POST http://localhost:2345/api/run/:runId/upload -F "file=@test-data/industry.csv" -u admin:password
curl -X POST http://localhost:2345/api/run/:runId/upload -F "file=@test-data/currency.csv" -u admin:password
```

## Generate Public and Private keys

To generate a public/private key pair you can run:

```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in private_key.pem -out public_key.pem
```

## To list your AWS profiles before pushing the image:

-   `aws configure list-profiles`

## To push image to ECR

-   `aws sso login --profile your-profile`
-   `AWS_PROFILE=your-profile AWS_REGION=your-region npm run deploy:ecr`
