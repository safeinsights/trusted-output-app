@Library('jenkins-shared-library@main') _
pipeline {

    agent { label 'jenkins' }

    stages {
        // stage('Env') {
        //     steps {
        //         sh 'printenv'
        //     }
        // }
        stage('Package Install') {
            steps {
                sh '''
                    npm install
                '''
            }
        }
        stage('Test') {
            steps {
                sh '''
                    npm run test:unit
                '''
            }
        }
        stage('SonarQube') {
            steps {
                script {
                    sonarqube.scan()
                }
            }
        }
        stage('Upload to AWS ECR') {
            steps {
                script {
                    aws.assumeRole("arn:aws:iam::337909745635:role/SafeInsights-DevDeploy")
                }
                sh '''
                    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 337909745635.dkr.ecr.us-east-1.amazonaws.com
                    docker build -t 337909745635.dkr.ecr.us-east-1.amazonaws.com/trusted-output-app:"${GIT_COMMIT}" .
                    docker push 337909745635.dkr.ecr.us-east-1.amazonaws.com/trusted-output-app:"${GIT_COMMIT}"
                '''
            }
        }
        // stage('Upload to Harbor') {
        //     environment {
        //         HARBOR_TOKEN = credentials('harbor-token')
        //     }
        //     steps {
        //         sh '''
        //             docker login https://harbor.safeinsights.org/ -u 'robot$jenkins' -p "${HARBOR_TOKEN_PSW}"
        //             docker build -t harbor.safeinsights.org/safeinsights-test/trusted-output-app:"${GIT_COMMIT}" .
        //             docker push harbor.safeinsights.org/safeinsights-test/trusted-output-app:"${GIT_COMMIT}"
        //         '''
        //     }
        // }
    }
}
