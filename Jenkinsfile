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
            environment {
                SONARQUBE_TOKEN = credentials('sonarqube_token')
            }
            steps {
                sh '''
                    docker run \
                    -e SONAR_HOST_URL="https://sonarqube.sandbox.safeinsights.org/" \
                    -e SONAR_TOKEN="${SONARQUBE_TOKEN}" \
                    -v "$(pwd):/usr/src" \
                    sonarsource/sonar-scanner-cli
                '''
            }
        }
        stage('Upload to AWS ECR') {
            steps {
                script {
                    aws.assumeRole()
                }
                sh '''
                    export AWS_ACCESS_KEY_ID="${env.AWS_ACCESS_KEY_ID}"
                    export AWS_SECRET_ACCESS_KEY="${env.AWS_SECRET_ACCESS_KEY}"
                    export AWS_SESSION_TOKEN="${env.AWS_SESSION_TOKEN}"
                    aws sts get-caller-identity

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
