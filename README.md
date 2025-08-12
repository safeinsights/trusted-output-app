# Welcome to the Trusted Output App

## This application is responsible for:

- Receiving a CSV file from the research container with the results of the code job
- Saving that CSV to memory (TBD) for the lifespan of this container
- Setting up results to be reviewed and sent to the Management App in one of two ways

### Option 1: Encrypt results and send to Management App

This happens if there are Member Reviewer [public keys](https://github.com/safeinsights/knowledge-base/blob/main/SafeInsights-Inter%E2%80%90App-Communication-API.md#get-apijobjobidkeys) (from the Member Reviewer Keypair) in the Management App's database.

- This app encrypts the results in a zip using the (encryption)[https://github.com/safeinsights/encryption] library and the Member Reviewers' public keys
- Then, it sends the encrypted results to the Management App at `/api/job/<jobId>/results`

### Option 2: Review results in TOA and send approved to Management App

This happens if there are 0 results encryption keys for that organization in the Management App database.

- This app allows members(TM) to log in and approve the results of the code job (AKA the CSV files)
- Once the members approve the results, it will post the CSV file to the Management App at `/api/job/<jobId>/results`

## Development

### TOA Authentication

Set the `HTTP_BASIC_AUTH` variable in `.env`. Example values `username:password` or `admin:password`

### Hitting the upload endpoint:

1. Create a study on the Management App
1. Get the UUID of the study here: http://localhost:4000/member/openstax/studies/review
1. Alternatively, you can run `docker compose exec postgres psql -U mgmnt mgmnt_dev -c 'select id,created_at from study_job;'`
1. Take that uuid and upload it manually like so:

    ```bash
    curl -X POST http://localhost:3002/api/job/:jobId/upload -F "file=@test-data/industry.csv" -u <HTTP_BASIC_AUTH>

    curl -X POST http://localhost:3002/api/job/:jobId/upload -F "file=@test-data/currency.csv" -u <HTTP_BASIC_AUTH>
    ```

1. Approve the study with the UUID you just uploaded

### Management App Authentication with Enclave Keypair

In `.env`, set the value of `MANAGEMENT_APP_PRIVATE_KEY` using key you set up to authenticate member routes on the [Management App](https://github.com/safeinsights/management-app?tab=readme-ov-file#enclave-api-routes).

```bash
echo "MANAGEMENT_APP_PUBLIC_KEY='`cat ./public_key.pem`'" >> .env
echo "MANAGEMENT_APP_PRIVATE_KEY='`cat ./private_key.pem`'" >> .env
```

### To list your AWS profiles before pushing the image:

- `aws configure list-profiles`

### To push image to ECR

- `aws sso login --profile your-profile`
- `AWS_PROFILE=your-profile AWS_REGION=your-region npm run deploy:ecr`

## Deployment Options

The Trusted Output App can be deployed in three different configurations depending on your infrastructure needs:

### Container Deployment (Default)

The traditional deployment method using Docker containers with full UI and API functionality.

**Build and run:**
```bash
npm run build
npm run docker:build
docker compose up
```

**Use cases:**
- Development environments
- Deployments where UI is required for manual approval workflow
- Traditional container orchestration platforms

### Lambda Serverless Deployment

Following the [setup-app](../setup-app/) architectural pattern, the TOA can be deployed as individual AWS Lambda functions for cost-effective, serverless operation.

#### Lambda Functions

Each API endpoint becomes a separate Lambda function:

- `src/lambda/health.ts` - Health check endpoint (`/api/health`)
- `src/lambda/job-upload.ts` - CSV upload processing (`/api/job/{jobId}/upload`)  
- `src/lambda/job-approve.ts` - Manual result approval (`/api/job/{jobId}/approve`)
- `src/lambda/job-status.ts` - Job status updates (`/api/job/{jobId}`)
- `src/lambda/jobs-list.ts` - List pending jobs (`/api/jobs`)

#### Lambda Build

```bash
npm run lambda:build
```

This creates optimized, bundled Lambda functions in `dist/lambda/`:
- `health.js` - ~1.2kb
- `job-upload.js` - ~136kb  
- `job-approve.js` - ~136kb
- `job-status.js` - ~135kb
- `jobs-list.js` - ~187kb

#### Lambda Architecture Benefits

- **Cost Optimization**: Pay only for execution time vs continuous container costs
- **Auto-scaling**: Built-in scaling without infrastructure management  
- **Reduced Bundle Size**: Individual functions vs full Next.js runtime
- **Fast Cold Starts**: Optimized esbuild bundles for quick initialization

#### Lambda Environment Variables

Same as container deployment:
- `HTTP_BASIC_AUTH` - Basic auth credentials  
- `MANAGEMENT_APP_API_URL` - Management App API endpoint
- `MANAGEMENT_APP_PRIVATE_KEY` - PEM-formatted private key for JWT signing
- `MANAGEMENT_APP_PUBLIC_KEY` - PEM-formatted public key for verification

#### Lambda Use Cases

- Production API-only deployments in secure enclaves
- Cost-sensitive environments with variable traffic
- Integration with existing serverless infrastructure
- Environments where UI is not required (encryption-only workflow)

### Deployment Comparison

| Feature | Container | Lambda Functions |
|---------|-----------|------------------|
| **UI Available** | ✅ Full UI | ❌ API only |
| **Cost Model** | Continuous running | Pay per execution |
| **Scaling** | Manual/orchestrator | Automatic |
| **Cold Start** | Always warm | 1-3 second delay |
| **Bundle Size** | Full Next.js app | Individual functions |
| **Infrastructure** | Container platform | Serverless platform |
