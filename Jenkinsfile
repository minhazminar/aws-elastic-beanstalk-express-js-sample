def dockerImage   // holds the built image object between stages

pipeline {
    agent none

    environment {
        IMAGE_NAME = "minhazminar/expressjs-app"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    options {
        timestamps()                                   // Timestamp every log line
        disableConcurrentBuilds()                       // One build at a time on the shared DinD daemon
        buildDiscarder(logRotator(numToKeepStr: '15'))  // Log/artifact retention policy
    }

    stages {

        stage('Checkout') {
            agent any
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:16'      
                    args '-u root:root' 
                }
            }
            steps {
                sh 'node -v && npm -v'
                sh 'npm install --save'
            }
        }

        stage('Run Unit Tests') {
            agent {
                docker {
                    image 'node:16'
                    args '-u root:root'
                }
            }
            steps {
                sh 'npm test'
            }
        }

        stage('Dependency Vulnerability Scan') {
            agent {
                docker {
                    image 'node:16'
                    args '-u root:root'
                }
            }
            steps {
                // Always save a full JSON report first (for evidence/archiving),
                // THEN re-run in gate mode so the build actually fails on High/Critical.
                sh 'npm audit --json > npm-audit-report.json || true'
                sh 'npm audit --audit-level=high'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'npm-audit-report.json', allowEmptyArchive: true, fingerprint: true
                }
            }
        }

        stage('Build Docker Image') {
            agent any   // controller has the Docker CLI + TLS certs to talk to the DinD daemon
            steps {
                script {
                    dockerImage = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            agent any
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        dockerImage.push("${IMAGE_TAG}")
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} succeeded: ${IMAGE_NAME}:${IMAGE_TAG} pushed to Docker Hub."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed - check the stage logs above. A failed 'Dependency Vulnerability Scan' stage means High/Critical issues were detected."
        }
    }
}
