# Welcome to the trusted output app

## This application is responsible for:

- Receiving a CSV file from the research container with the results of the code job
- Saving that CSV to memory (TBD) for the lifespan of this container
- Setting up results to be reviewed and sent to the Management App in one of two ways

### Option 1: Encrypt results and send to Management App

This happens if there are member-reviewer public keys in the management app's database.

- This app encrypts the results in a zip using the (encryption)[https://github.com/safeinsights/encryption] library and the member-reviewers' public keys
- Then, it sends the encrypted results to the management app at `/api/job/<jobId>/results`

### Option 2: Review results in TOA and send approved to Management App

This happens if there are 0 results encryption keys for that organization in the Management App database.

- This app allows members(TM) to log in and approve the results of the code job (AKA the CSV files)
- Once the members approve the results, it will post the CSV file to the management app at `/api/job/<jobId>/results`

## Development

### TOA Authentication

Set the `HTTP_BASIC_AUTH` variable in `.env`. Example values `username:password` or `admin:password`

### Hitting the upload endpoint:

1. Create a study on the management app
1. Get the UUID of the study here: http://localhost:4000/member/openstax/studies/review
1. Alternatively, you can run `docker compose exec postgres psql -U mgmnt mgmnt_dev -c 'select id,created_at from study_job;'`
1. Take that uuid and upload it manually like so:
    ```bash
    curl -X POST http://localhost:3002/api/job/:jobId/upload -F "file=@test-data/industry.csv" -u <HTTP_BASIC_AUTH>

    curl -X POST http://localhost:3002/api/job/:jobId/upload -F "file=@test-data/currency.csv" -u <HTTP_BASIC_AUTH>
    ```
1. Approve the study with the UUID you just uploaded

### Management App Authentication with Enclave Keypair

In `.env`, set the value of `MANAGEMENT_APP_PRIVATE_KEY` using key you set up to authenticate member routes on the [management app](https://github.com/safeinsights/management-app?tab=readme-ov-file#enclave-api-routes).

```bash
echo "MANAGEMENT_APP_PUBLIC_KEY='`cat ./public_key.pem`'" >> .env
echo "MANAGEMENT_APP_PRIVATE_KEY='`cat ./private_key.pem`'" >> .env
```

### To list your AWS profiles before pushing the image:

- `aws configure list-profiles`

### To push image to ECR

- `aws sso login --profile your-profile`
- `AWS_PROFILE=your-profile AWS_REGION=your-region npm run deploy:ecr`
