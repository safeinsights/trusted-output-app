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
                    npm test:unit
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

        stage('Upload to Harbor') {
            environment {
                HARBOR_TOKEN = credentials('harbor-token')
            }
            steps {
                sh '''
                    docker login https://harbor.safeinsights.org/ -u 'robot$jenkins' -p "${HARBOR_TOKEN_PSW}"
                    docker build -t harbor.safeinsights.org/safeinsights-test/trusted-output-app:"${GIT_COMMIT}" .
                    docker push harbor.safeinsights.org/safeinsights-test/trusted-output-app:"${GIT_COMMIT}"
                '''
            }
        }
    }
}
