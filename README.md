# Hitting the upload endpoint: 
```
curl -X POST http://localhost:3000/api/run/:runId/upload -F "file=@test-data/industry.csv" -u admin:password   
curl -X POST http://localhost:3000/api/run/:runId/upload -F "file=@test-data/currency.csv" -u admin:password   
```
