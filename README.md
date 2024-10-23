# Welcome to the trusted output app

## This application is responsible for:

-   Receiving a CSV file from the research container with the results of the code run
-   Saving that CSV to memory (TBD) for the lifespan of this container
-   Allowing members(TM) to log in and approve the results of the code run (AKA the CSV files)
-   Once the members approve the results, this application will post the CSV file to the management app (Endpoint TBD)

## Hitting the upload endpoint:

```
curl -X POST http://localhost:3002/api/run/:runId/upload -F "file=@test-data/industry.csv" -u admin:password
curl -X POST http://localhost:3002/api/run/:runId/upload -F "file=@test-data/currency.csv" -u admin:password
```

## Generate Public and Private keys

To generate a public/private key pair you can run:

```bash
openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in private_key.pem -out public_key.pem
echo "MANAGEMENT_APP_PUBLIC_KEY='`cat ./public_key.pem`'" >> .env
echo "MANAGEMENT_APP_PRIVATE_KEY='`cat ./private_key.pem`'" >> .env
```

## To list your AWS profiles before pushing the image:

-   `aws configure list-profiles`

## To push image to ECR

-   `aws sso login --profile your-profile`
-   `AWS_PROFILE=your-profile AWS_REGION=your-region npm run deploy:ecr`


## To hit the management app
1. Create a study on the management app
1. Get the UUID of the study here: http://localhost:4000/member/openstax/studies/review
1. Alternatively, you can run `docker compose exec postgres psql -U mgmnt mgmnt_dev -c 'select id,status from study_run;'`
1. take that uuid and upload it manually like so: `curl -X POST http://localhost:3002/api/run/{Run_UUID_HERE}/upload -F "file=@test-data/industry.csv" -u admin:password
1. Approve the study with the UUID you just uploaded
`
