# Hitting the upload endpoint: 
```
curl -X POST http://localhost:3000/api/upload -F 'file=@test-data/industry.csv' -F 'data={"researcher": "researcher", "study": "study"}'  -u admin:password   
curl -X POST http://localhost:3000/api/upload -F "file=@test-data/currency.csv" -F 'data={"researcher": "researcher", "study": "study"}' -u admin:password   
```
