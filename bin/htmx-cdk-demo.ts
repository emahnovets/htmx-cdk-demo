#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ToDosStack } from '../lib/todos-stack';

const app = new cdk.App();

const HOSTED_ZONE_NAME = 'em-dev.org';
const DOMAIN_NAME = `todos.${HOSTED_ZONE_NAME}`;

new ToDosStack(app, 'HtmxCdkDemoApp', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  domainName: DOMAIN_NAME,
  hostedZoneName: HOSTED_ZONE_NAME,
});
